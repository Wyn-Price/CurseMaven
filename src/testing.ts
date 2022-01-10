import { RequestHandler } from 'express';
import fetch from 'node-fetch';
import { classifierTries } from './classifierjar';
import { getDownloadUrl, getRedirectUrl } from './util';


const testing: RequestHandler = async (req, res) => {
  const { id, file, classifier } = req.params
  const output = [
    `Raw URL: ${req.url}`,
    ``,
    `ProjectId: ${id}`,
    `FileId: ${file}`,
    `Classifier: ${classifier}`,
    ``,
    `Download URL: ${getDownloadUrl(id, file)}`,
  ]

  const flush = () => res.send(output.join("\n"))

  res.contentType("text/plain")

  try {
    await runTests(id, file, classifier, output, flush)
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

const runTests = async (id: string, file: string, classifier: string, output: string[], flush: () => void) => {
  const mainResponse = await fetchUrlTest(getDownloadUrl(id, file), output, flush)
  const mainResponseBody = await mainResponse.text()
  output.push(`Resolved ${mainResponse.status} ${mainResponseBody}`)

  if (!mainResponse.ok) {
    output.push("\n\nJAR WAS NOT FOUND")
    return flush()
  }

  if (classifier === undefined || classifier === '') {
    output.push(`\nResult: ${getRedirectUrl(mainResponseBody)}`)
    return flush()
  }

  const jarName = mainResponseBody.substring(mainResponseBody.lastIndexOf('/'), mainResponseBody.length - 4)
  const endOfUrlToLookFor = `${jarName}-${classifier}.jar`
  const numId = parseInt(file)


  output.push(`ParsedID: ${numId}`)
  output.push(`Searching for classifier: '${classifier}'`)
  output.push(`Jarname: '${jarName}-${classifier}.jar'`)
  output.push(`Tries: ${classifierTries}`)

  for (let i = 0; i < classifierTries; i++) {
    output.push(`\nIteration: ${i}`)
    const response = await fetchUrlTest(getDownloadUrl(id, numId + i + 1), output, flush)
    output.push(`    Response: ${response.status}`)
    if (response.ok) {
      const fileUrl = await response.text()

      const found = fileUrl.endsWith(endOfUrlToLookFor)
      output.push(`    '${fileUrl}' -> ${found}`)
      if (found) {
        output.push(`\nResult: ${getRedirectUrl(fileUrl)}`)
        return flush()
      }
    }
  }
  output.push("\n\nCLASSIFIER WAS NOT FOUND")
  flush()

}

const fetchUrlTest = async (url: string, output: string[], flush: () => void) => {
  try {
    const fetched = await fetch(url)
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