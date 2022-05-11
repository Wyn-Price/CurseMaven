import escapeHTML from "escape-html";
import express, { RequestHandler } from "express";
import createClassifierMap from "./classifiermap";
import direct from "./direct";
import normaljar from "./normaljar";
import pom from "./pom";
import testing from "./testing";
import { log } from "./util";

const app = express();

const urlBase = "/curse/maven/:descriptor/:fileIds/:filename"

const verifyParams: RequestHandler = (req, res, next) => {
  const { descriptor, fileIds, filename } = req.params
  //Examples with curse.maven:example-jei-238222:2724420-sources-2724421:classifier -> /curse/maven/example-jei-238222/2724420/example-jei-238222-2724420-classifier.jar
  //    descriptor: 'example-jei-238222'
  //    fileIds: '2724420-sources-2724421'
  //    filename: 'example-jei-238222-2724420-sources-2724421-classifier'

  //['2724420', 'sources', '2724421']
  const fileIdsSplit = fileIds.split("-")

  //['example', 'jei', '238222']
  const descriptorSplit = descriptor.split("-")
  if (descriptorSplit.length < 2) {
    return res.status(400).send("Descriptor now must be in the format `<modname>-<projectid>")
  }

  const map = createClassifierMap(fileIds);
  if (map === null) {
    return res.status(400).send("Unable to generate classifier map")
  }
  const { main, classifierMap } = map

  const name = descriptorSplit.slice(0, descriptorSplit.length - 1).join("-")
  const id = descriptorSplit[descriptorSplit.length - 1]
  //From Example
  //    name: 'example-jei'
  //    id: '238222'

  //['example', 'jei', '238222', '2724420', 'classifier']
  const filenameSplit = filename.split("-")
  if (filenameSplit.length < 3) {
    return res.sendStatus(401)
  }

  //My brother in christ please rewrite this code. 
  //Essentially, I'm using the previous URL artifacts to validate the URL, and get the classifier
  const _name = filenameSplit.slice(0, descriptorSplit.length - 1).join("-")
  const _id = filenameSplit[descriptorSplit.length - 1]
  const _file = filenameSplit.slice(descriptorSplit.length).slice(0, fileIdsSplit.length).join("-")
  const classifier = filenameSplit.slice(descriptorSplit.length + fileIdsSplit.length).join("-")
  //From Example
  //    _name: 'example-jei'
  //    _id: '238222'
  //    _file: '2724420'
  //    classifier: 'classifier'

  //Check the url parts match up

  if (name !== _name || id !== _id || fileIds !== _file) {
    return res.sendStatus(404)
  }

  const foundId = classifier === "" ? main : classifierMap[classifier]
  if (foundId === undefined) {
    return res.status(404).send(`Unable to find classifier ${escapeHTML(classifier)} as it was not defined.`)
  }

  res.locals.id = id
  res.locals.file = foundId
  res.locals.name = name

  log(`project_id=${id},project_named=${name},file_id=${main},classifier=${classifier ?? 'n/a'}`)

  next()
}

app.get(`${urlBase}.jar`, verifyParams, normaljar)
app.get(`${urlBase}.pom`, verifyParams, pom)
app.get(`${urlBase}.md5`, (_, res) => res.sendStatus(404))
app.get(`${urlBase}.sha1`, (_, res) => res.sendStatus(404))
app.get(`${urlBase}.*`, verifyParams, direct)

app.get("/test/:id/:fileIds/:classifier?", testing)

export default app