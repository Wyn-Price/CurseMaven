import escapeHTML from 'escape-html';
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


  try {
    await runTests(projId, fileIds, output)
  } catch (e) {
    if (!(e instanceof ExitError)) {
      output.push("\n\n")
      output.push("---------- ERROR ----------")
      output.push("Unknown Error encounted")
      if (e instanceof Error) {
        output.push(`${e.name}: ${e.message}`)
        console.error("ERROR GENERATING TESTS:")
        console.error(e)
      }
    }
  }

  res.contentType("text/plain")
  res.send(escapeHTML(output.join("\n")))
}

const runTests = async (id: string, fileIds: string, output: string[]) => {
  const map = createClassifierMap(fileIds)
  if (map === null) {
    output.push("Unable to generate classifier map")
    return
  }
  const { main, classifierMap } = map

  output.push(`MainFileId: ${main}`)
  await fetchUrlTest(id, main, output)

  const allClassifiers = Object.keys(classifierMap)
  if (allClassifiers.length === 0) {
    return
  }
  output.push("\n\nClassifierIdMap:")
  for (let i = 0; i < allClassifiers.length; i++) {
    const classifier = allClassifiers[i]
    const classifierId = classifierMap[classifier]
    output.push(`\n${classifier} (${classifierId}):`)

    await fetchUrlTest(id, classifierId, output, "    ")
  }
}

const fetchUrlTest = async (id: string, fileId: string, output: string[], prefix = "") => {
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
    throw new ExitError()
  }
}

class ExitError extends Error { }

export default testing