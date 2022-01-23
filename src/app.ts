import express, { RequestHandler } from "express";
import classifierjar from "./classifierjar";
import direct from "./direct";
import normaljar from "./normaljar";
import pom from "./pom";
import testing from "./testing";
import { log } from "./util";

const app = express();

const urlBase = "/curse/maven/:descriptor/:file(\\d+)/:filename"

const verifyParams: RequestHandler = (req, res, next) => {
  const { descriptor, file, filename } = req.params
  //Examples with curse.maven:example-jei-238222:2724420:classifier -> /curse/maven/example-jei-238222/2724420/example-jei-238222-2724420-classifier.jar
  //    descriptor: 'example-jei-238222'
  //    file: '2724420'
  //    filename: 'example-jei-238222-2724420-classifier'

  //['example', 'jei', '238222']
  const descriptorSplit = descriptor.split("-")
  if (descriptorSplit.length < 2) {
    return res.status(400).send("Descriptor now must be in the format `<modname>-<projectid>")
  }


  const name = descriptorSplit.slice(0, descriptorSplit.length - 1).join("-")
  const id = descriptorSplit[descriptorSplit.length - 1]
  //From Example
  //    name: 'example-jei'
  //    id: '238222'

  //['example', 'jei', '238222', '2724420', 'classifier']
  const filenameSplit = filename.split("-")
  if (filenameSplit.length < 3) {
    return res.sendStatus(401)
  }

  const _name = filenameSplit.slice(0, descriptorSplit.length - 1).join("-")
  const _id = filenameSplit[descriptorSplit.length - 1]
  const _file = filenameSplit[descriptorSplit.length]
  const classifier = filenameSplit.slice(descriptorSplit.length + 1).join("-")
  //From Example
  //    _name: 'example-jei'
  //    _id: '238222'
  //    _file: '2724420'
  //    classifier: 'classifier'

  //Check the url parts match up

  if (name !== _name || id !== _id || file !== _file) {
    return res.sendStatus(404)
  }

  req.params.id = id
  req.params.name = name
  req.params.classifier = classifier

  log(`project_id=${id},project_named=${name},file_id=${file},classifier=${classifier ?? 'n/a'}`)

  next()
}

app.get(`${urlBase}.jar`, verifyParams, normaljar, classifierjar)
app.get(`${urlBase}.pom`, verifyParams, pom)
app.get(`${urlBase}.*`, verifyParams, direct)

app.get("/test/:id/:file/:classifier?", testing)

export default app