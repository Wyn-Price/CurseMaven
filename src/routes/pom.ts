import { RequestHandler } from "express";

const pom: RequestHandler = async (req, res) => {
  const { descriptor, fileIds } = req.params
  return res.send(
    `<?xml version="1.0" encoding="UTF-8"?>
    <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <modelVersion>4.0.0</modelVersion>
      <groupId>curse.maven</groupId>
      <artifactId>${descriptor}</artifactId>
      <version>${fileIds}</version>
    </project>`
  )
}

export default pom