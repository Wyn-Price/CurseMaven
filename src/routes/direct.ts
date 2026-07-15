import { RequestHandler } from "express";
import { fetchDownloadUrl, FOLLOW_REDIRECT_HEADER, getRedirectUrl } from "./util";

const direct: RequestHandler = async (req, res) => {
  const { id, file } = res.locals

  const response = await fetchDownloadUrl(id, file)
  if (response.ok) {
    // The cloudflare worker follows this redirect itself and streams the
    // file back, as redirecting the client to the cdn breaks gradle (#41).
    // Deployments without the worker serve the redirect as-is.
    res.setHeader(FOLLOW_REDIRECT_HEADER, "1")
    return res.redirect(await getRedirectUrl(response))
  } else {
    return res.status(response.status).send(response.statusText)
  }
}

export default direct