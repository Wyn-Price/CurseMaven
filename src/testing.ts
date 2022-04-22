import { RequestHandler } from 'express';
import createClassifierMap from './classifiermap';
import { authFetch, getDownloadUrl, getFetchedData, getRedirectUrl } from './util';


const testing: RequestHandler = async (req, res) => {
  const { id, fileIds } = req.params
  const output = [
    `Raw URL: ${req.url}`,
    ``,
    `ProjectId: ${id}`,
    `FileIds: ${fileIds}`
  ]

  const flush = () => res.send(output.join("\n"))

  res.contentType("text/plain")

  try {
    await runTests(id, fileIds, output, flush)
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
  const mainResponse = await fetchUrlTest(getDownloadUrl(id, main), output, flush)
  output.push(`Resolved ${mainResponse.status}`)
  if (!mainResponse.ok) {
    output.push(`Main Not found: ${mainResponse.statusText}`)
    return
  }
  output.push(`Found ${await getFetchedData(mainResponse)}`)

  const allClassifiers = Object.keys(classifierMap)
  if (allClassifiers.length === 0) {
    return
  }
  output.push("\n\nClassifierIdMap:")
  for (let i = 0; i < allClassifiers.length; i++) {
    const classifier = allClassifiers[i]
    const classifierId = classifierMap[classifier]
    output.push(`\n${classifier} (${classifierId}):`)

    const response = await fetchUrlTest(getDownloadUrl(id, classifierId), output, flush)
    output.push(`    Response: ${response.status}`)
    if (response.ok) {
      const fileUrl = await getFetchedData(response)
      output.push(`    Found: ${fileUrl}`)
    } else {
      output.push(`    Not Found: ${response.statusText}`)
    }
  }
}

const fetchUrlTest = async (url: string, output: string[], flush: () => void) => {
  try {
    const fetched = await authFetch(url)
    output.push("GET: " + url)
    return fetched
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