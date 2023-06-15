import escapeHTML from 'escape-html';
import { Request, RequestHandler } from 'express';
import createClassifierMap from './classifiermap';

type SplitData = {
  fileIdsSplit: string[];
  descriptorSplit: string[];
  filenameSplit: string[];
}
type DescriptorParts = {
  name: string,
  id: string
}
type FilenameParts = {
  name: string,
  id: string,
  file: string,
  classifier: string
}

const verifyParams: RequestHandler = (req, res, next) => {
  try {
    verifyParamsOrThrow(req, res, next)
  } catch (err) {
    if (err instanceof InvalidParamsError) {
      return res.status(err.statusCode).send(escapeHTML(err.text))
    } else {
      throw err
    }
  }
}

const verifyParamsOrThrow: RequestHandler = (req, res, next) => {
  const gradleVersion = checkGradleVersion(req)

  const { descriptor, fileIds, filename } = req.params
  //Examples with curse.maven:example-jei-238222:2724420-sources-2724421:classifier -> /curse/maven/example-jei-238222/2724420/example-jei-238222-2724420-classifier.jar
  //    descriptor: 'example-jei-238222'
  //    fileIds: '2724420-sources-2724421'
  //    filename: 'example-jei-238222-2724420-sources-2724421-classifier'


  const splitData = splitAndValidate(fileIds, descriptor, filename)

  const map = createClassifierMap(fileIds);
  if (map === null) {
    throw new InvalidParamsError(400, "Unable to generate classifier map")
  }
  const { main, classifierMap } = map

  const descriptorParts = getNameAndIdFromDescriptor(splitData)
  const filenameParts = createFilenameParts(splitData)

  validatePartsEqual(descriptorParts, filenameParts, fileIds)

  const classifier = filenameParts.classifier

  const foundId = classifier === "" ? main : classifierMap[classifier]
  if (foundId === undefined) {
    return res.status(404).send(`Unable to find classifier ${classifier} as it was not defined.`)
  }

  res.locals.id = descriptorParts.id
  res.locals.name = descriptorParts.name
  res.locals.file = foundId

  const params = new URLSearchParams({
    project_id: encodeURIComponent(descriptorParts.id),
    project_named: encodeURIComponent(descriptorParts.name),
    file_id: encodeURIComponent(main),
    classifier: encodeURIComponent(classifier),
    gradle_version: encodeURIComponent(gradleVersion)
  });
  res.setHeader("X-CurseMaven-Stats", params.toString());

  next()
}

const checkGradleVersion = (req: Request) => {
  const ua = req.header("User-agent")
  if (ua !== undefined) {
    const match = ua.match(/Gradle\/([\d\\.]+)/)
    if (match !== null) {
      //Convert 7.2 --> 7.2.0
      const segments = match[1].split(".")
      while (segments.length < 3) {
        segments.push("0")
      }
      return segments.join(".")
    }
  }
  // if(process.env.NODE_ENV !== "test") {
  //   throw new InvalidParamsError(400, "Tried to query outside of gradle")
  // }
  return ""
}


//fileIds: 2724420-sources-2724421
//descriptor: example-jei-238222
//filename: example-jei-238222-2724420-classifier
// =>
//fileIdsSplit: ['2724420', 'sources', '2724421']
//descriptorSplit: ['example', 'jei', '238222']
//filenameSplit = ['example', 'jei', '238222', '2724420', 'classifier']
const splitAndValidate = (fileIds: string, descriptor: string, filename: string): SplitData => {
  const fileIdsSplit = fileIds.split("-")
  const descriptorSplit = descriptor.split("-")
  const filenameSplit = filename.split("-")
  if (descriptorSplit.length < 2) {
    throw new InvalidParamsError(400, "Descriptor now must be in the format `<modname>-<projectid>")
  }

  if (filenameSplit.length < 3) {
    throw new InvalidParamsError(400, "Bad Request")
  }
  return { fileIdsSplit, descriptorSplit, filenameSplit }
}

//Joins all by the last item as `name,` and names the last item `id`
//descriptorSplit: ['example', 'jei', '238222']
// =>
//name: 'example-jei'
//id: '238222'
const getNameAndIdFromDescriptor = (split: SplitData): DescriptorParts => {
  const { descriptorSplit } = split
  const name = descriptorSplit.slice(0, descriptorSplit.length - 1).join("-")
  const id = descriptorSplit[descriptorSplit.length - 1]
  return {
    name, id
  }

}

const createFilenameParts = (split: SplitData): FilenameParts => {
  const { descriptorSplit, fileIdsSplit, filenameSplit } = split

  //My brother in christ please rewrite this code. 
  //Essentially, I'm using the previous URL artifacts to validate the URL, and get the classifier
  const name = filenameSplit.slice(0, descriptorSplit.length - 1).join("-")
  const id = filenameSplit[descriptorSplit.length - 1]
  const file = filenameSplit.slice(descriptorSplit.length).slice(0, fileIdsSplit.length).join("-")
  const classifier = filenameSplit.slice(descriptorSplit.length + fileIdsSplit.length).join("-")
  //From Example
  //    _name: 'example-jei'
  //    _id: '238222'
  //    _file: '2724420'
  //    classifier: 'classifier'

  return {
    name, id, file, classifier
  }
}

//Check the url parts match up
const validatePartsEqual = (descriptorParts: DescriptorParts, filenameParts: FilenameParts, fileIds: string) => {
  if (descriptorParts.name !== filenameParts.name || descriptorParts.id !== filenameParts.id || fileIds !== filenameParts.file) {
    throw new InvalidParamsError(400, "Bad Request")
  }
}


class InvalidParamsError extends Error {
  constructor(
    public statusCode: number,
    public text: string,
  ) {
    super(`[${statusCode}]: ${text}`)
  }
}


export default verifyParams