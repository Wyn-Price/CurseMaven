import AggregateError from "es-aggregate-error";
import { RequestHandler } from 'express';
import PromiseAny from "promise.any";
import { fetchDownloadUrl, getFetchedData, getRedirectUrl } from './util';

export const classifierTries = 10

const classifierjar: RequestHandler = async (req, res) => {
  const { id, file, classifier } = req.params

  const startTime = Date.now()

  const mainResponse = await fetchDownloadUrl(id, file)
  if (!mainResponse.ok) {
    return res.sendStatus(mainResponse.status)
  }

  const mainUrl = await getFetchedData(mainResponse)

  const fetchedTime = Date.now()
  console.log(`classifier_main_request=${fetchedTime - startTime}`)

  const jarName = mainUrl.substring(mainUrl.lastIndexOf('/'), mainUrl.length - 4)
  const endOfUrlToLookFor = `${jarName}-${classifier}.jar`

  const numFileId = parseInt(file)

  //Run all requests async, and get the first one (if any) to resolve.
  const fetchPromises = Array.from({ length: classifierTries }, async (_, i) => {
    const response = await fetchDownloadUrl(id, numFileId + i + 1)
    if (response.ok) {
      const fileUrl = await getFetchedData(response)
      if (fileUrl.endsWith(endOfUrlToLookFor)) {
        return fileUrl
      }
    }
    return Promise.reject()
  })

  try {
    return res.redirect(getRedirectUrl(await PromiseAny(fetchPromises)))
  } catch (e) {
    if (!(e instanceof AggregateError)) {
      throw e
    }
  } finally {
    const finishedTime = Date.now()
    console.log(`classifier_sub_requests=${finishedTime - fetchedTime}`)
  }

  return res.sendStatus(404)
}

export default classifierjar