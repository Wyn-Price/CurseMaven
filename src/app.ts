import express, { Request, RequestHandler } from "express";
import fetch from "node-fetch";
import classifierjar from "./classifierjar";
import normaljar from "./normaljar";
import pom from "./pom";
import testing from "./testing";

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

  next()
}

app.get(`${urlBase}.jar`, verifyParams, normaljar, classifierjar)
app.get(`${urlBase}.pom`, verifyParams, pom)

app.get("/test/:id/:file/:classifier?", testing)

//Ideally this would be a rewrite (proxy pass), however thanks to gradle, we need to do it manually
app.get("/download-binary/*", async (req: Request<{ "0": string }>, res) => {
  fetch(`https://media.forgecdn.net/files/${req.params[0]}`).then(r => {
    //Copy over some of the headers 
    for (let header of ["content-type", "content-length", "accept-ranges"]) {
      const value = r.headers.get(header)
      if (value !== null) {
        res.header(header, value)
      }
    }

    res.status(r.status)

    //Pipe the body
    r.body.pipe(res)

  })
})

export default app