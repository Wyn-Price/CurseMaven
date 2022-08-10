import express from "express";
import direct from "./direct";
import normaljar from "./normaljar";
import pom from "./pom";
import testing from "./testing";
import verifyParams from "./verifyparams";

const app = express();

const urlBase = "/curse/maven/:descriptor/:fileIds/:filename"

app.get(`${urlBase}.jar`, verifyParams, normaljar)
//Although we don't use `verifyParams` for the pom, it's still good to 
//prevent malformed maven coordinates producing a valid pom
app.get(`${urlBase}.pom`, verifyParams, pom)
app.get(`${urlBase}.md5`, (_, res) => res.sendStatus(404))
app.get(`${urlBase}.sha1`, (_, res) => res.sendStatus(404))
app.get(`${urlBase}.*`, verifyParams, direct)

app.get("/test/:id/:fileIds/:classifier?", testing)

export default app