import { RequestHandler } from "express";
import { fetchDownloadUrl, getFetchedData, getRedirectUrl } from "./util";

const normaljar: RequestHandler = async (req, res) => {
  const { id, file } = res.locals

  const response = await fetchDownloadUrl(id, file)
  if (response.ok) {
    return res.redirect(getRedirectUrl(await getFetchedData(response)))
  } else {
    return res.status(response.status).send(response.statusText)
  }
}

export default normaljar