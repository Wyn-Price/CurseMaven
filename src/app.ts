import express from "express";
import direct from "./routes/direct";
import pom from "./routes/pom";
import testing from "./routes/testing";
import verifyParams from "./routes/verifyparams";

const app = express();

const urlBase = "/curse/maven/:descriptor/:fileIds/:filename"

app.set("strict routing", false);

app.get(`${urlBase}.jar`, verifyParams, direct)
//Although we don't use `verifyParams` for the pom, it's still good to
//prevent malformed maven coordinates producing a valid pom
app.get(`${urlBase}.pom`, verifyParams, pom)
app.get(`${urlBase}.md5`, (_, res) => res.sendStatus(404))
app.get(`${urlBase}.sha1`, (_, res) => res.sendStatus(404))
app.get(`${urlBase}.:ext`, verifyParams, direct)

app.get("/test/:id/:fileIds", testing)
app.get('/source', (_, res) => res.redirect("https://github.com/Wyn-Price/CurseMaven/"));

export default app
