import { RequestHandler } from 'express';
import createClassifierMap from './classifiermap';
import { authFetch, getDownloadUrl, getFetchedData, getRedirectUrl } from './util';


const testing: RequestHandler = async (req, res) => {
  const { id, fileIds } = req.params
  const descriptorSplit = id.split("-")

  const name = descriptorSplit.slice(0, descriptorSplit.length - 1).join("-")
  const projId = descriptorSplit[descriptorSplit.length - 1]

  const output = [
    `Raw URL: ${req.url}`,
    ``,
    `ProjectDescriptor: ${id}`,
    `ProjectDescriptorSplit: ${descriptorSplit}`,
    `ProjectName: ${name}`,
    `ProjectId: ${projId}`,
    ``,
    `FileIds: ${fileIds}`
  ]

  const flush = () => res.send(output.join("\n"))

  res.contentType("text/plain")

  try {
    await runTests(projId, fileIds, output, flush)
    flush()
  } catch (e) {
    if (!(e instanceof ExitError)) {
      output.push("\n\n")
      output.push("---------- ERROR ----------")
      output.push("Unknown Error encounted")
      output.push(String(e))
      flush()
    }
  }
}

const runTests = async (id: string, fileIds: string, output: string[], flush: () => void) => {

  const map = createClassifierMap(fileIds)
  if (map === null) {
    output.push("Unable to generate classifier map")
    return
  }
  const { main, classifierMap } = map

  output.push(`MainFileId: ${main}`)
  await fetchUrlTest(id, main, output, flush)

  const allClassifiers = Object.keys(classifierMap)
  if (allClassifiers.length === 0) {
    return
  }
  output.push("\n\nClassifierIdMap:")
  for (let i = 0; i < allClassifiers.length; i++) {
    const classifier = allClassifiers[i]
    const classifierId = classifierMap[classifier]
    output.push(`\n${classifier} (${classifierId}):`)

    await fetchUrlTest(id, classifierId, output, flush, "    ")
  }
}

const fetchUrlTest = async (id: string, fileId: string, output: string[], flush: () => void, prefix = "") => {
  const url = getDownloadUrl(id, fileId)
  try {
    const fetched = await authFetch(url)
    output.push("GET: " + url)
    output.push(`${prefix}Response: ${fetched.status}`)
    if (!fetched.ok) {
      output.push(`${prefix}Not Found: ${fetched.statusText}`)
      throw new ExitError()
    }

    const fileUrl = await getFetchedData(fetched)
    output.push(`${prefix}Found: ${fileUrl}`)
  } catch (e) {
    output.push("\n\n")
    output.push("---------- ERROR ----------")
    output.push("Unable to fetch url " + url)
    output.push(String(e))
    flush()
    throw new ExitError()
  }
}

class ExitError extends Error { }

export default testing