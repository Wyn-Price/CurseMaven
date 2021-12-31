import { RequestHandler } from 'express';
import { fetchDownloadUrl, getRedirectUrl } from './util';

export const classifierTries = 10

const classifierjar: RequestHandler = async (req, res) => {
  const { id, file, classifier } = req.params

  const mainResponse = await fetchDownloadUrl(id, file)
  if (!mainResponse.ok) {
    return res.sendStatus(mainResponse.status)
  }
  const mainUrl = await mainResponse.text()

  const jarName = mainUrl.substring(mainUrl.lastIndexOf('/'), mainUrl.length - 4)
  const endOfUrlToLookFor = `${jarName}-${classifier}.jar`

  const numFileId = parseInt(file)

  for (let i = 0; i < classifierTries; i++) {
    const response = await fetchDownloadUrl(id, numFileId + i + 1)
    if (response.ok) {
      const fileUrl = await response.text()
      if (fileUrl.endsWith(endOfUrlToLookFor)) {
        return res.redirect(getRedirectUrl(fileUrl))
      }
    }
  }

  return res.sendStatus(404)
}

export default classifierjar