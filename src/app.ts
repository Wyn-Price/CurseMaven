import express, { Request } from "express";
import direct from "./direct";
import normaljar from "./normaljar";
import pom from "./pom";
import testing from "./testing";
import verifyParams from "./verifyparams";
import {jarHash, pomHash} from "./checksums";

const app = express();

const urlBase = "/curse/maven/:descriptor/:fileIds/:filename"

app.use(express.static("public", {
    extensions: ["html"],
}));

app.get(`${urlBase}.jar`, verifyParams, normaljar)
// Although we don't use `verifyParams` for the pom, it's still good to
// prevent malformed maven coordinates producing a valid pom
app.get(`${urlBase}.pom`, verifyParams, pom)
app.get(`${urlBase}.pom.:algorithm`, verifyParams, pomHash)
app.get(`${urlBase}.jar.:algorithm`, verifyParams, jarHash)
app.get(`${urlBase}.*`, verifyParams, direct)

app.get("/test/:id/:fileIds/:classifier?", testing)
app.get('/source', (_, res) => res.redirect("https://github.com/Wyn-Price/CurseMaven/"));

export default app