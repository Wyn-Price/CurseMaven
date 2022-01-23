import { RequestHandler } from "express";
import { fetchDownloadUrl } from "./util";

const direct: RequestHandler = async (req, res) => {
  const { id, file } = req.params

  const response = await fetchDownloadUrl(id, file)
  if (response.ok) {
    return res.redirect(await response.text())
  } else {
    return res.status(response.status).send(response.statusText)
  }
}

export default direct