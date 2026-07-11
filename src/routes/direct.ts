import { RequestHandler } from "express";
import { authFetch, fetchDownloadUrl, getRedirectUrl, pipeResponse } from "./util";

const direct: RequestHandler = async (req, res) => {
  const { id, file } = res.locals

  const response = await fetchDownloadUrl(id, file)
  if (response.ok) {
    return await pipeResponse(await authFetch(await getRedirectUrl(response)), res)
  } else {
    return res.status(response.status).send(response.statusText)
  }
}

export default direct