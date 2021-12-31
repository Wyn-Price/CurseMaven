import express, { Request, RequestHandler } from "express";
import fetch from "node-fetch";
import classifierjar from "./classifierjar";
import normaljar from "./normaljar";
import pom from "./pom";
import testing from "./testing";

const app = express();

const urlBase = "/curse/maven/:name-:id(\\d+)/:file(\\d+)/:_name-:_id-:_file"

const verifyParams: RequestHandler = (req, res, next) => {
  const { name, id, file, _name, _id, _file } = req.params
  //Check the url parts match up
  if (name !== _name || id !== _id || file !== _file) {
    return res.sendStatus(404)
  }
  next()
}

app.get(`${urlBase}.jar`, verifyParams, normaljar)
app.get(`${urlBase}-:classifier.jar`, verifyParams, classifierjar)
app.get(`${urlBase}.pom`, verifyParams, pom)

app.get("/test/:id/:file/:classifier?", testing)

//Ideally this would be a rewrite (proxy pass), however thanks to gradle, we need to do it manually
app.get("/download-binary/*", async (req: Request<{ "0": string }>, res) => {
  fetch(`https://media.forgecdn.net/files/${req.params[0]}`).then(r => r.body.pipe(res))
})

export default app