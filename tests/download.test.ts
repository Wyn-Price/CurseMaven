import { describe, test } from "@jest/globals"
import supertest from "supertest"
import server from "../src/index"

const requestWithSupertest = supertest(server)

const downloadUrl = (descriptor: string, id: string, file: string, extension: string) =>
  `/curse/maven/${descriptor}-${id}/${file}/${descriptor}-${id}-${file}${extension}`

describe('Normal Download URL', () => {
  test('Normal Jar should be correct', async () => {
    //curse.maven:jei-238222:2724420
    const res = await requestWithSupertest.get(downloadUrl('jei', '238222', '2724420', '.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("https://edge.forgecdn.net/files/2724/420/jei_1.12.2-4.15.0.281.jar")
  })

  test('Normal Jar w/ problamatic chars should be correct', async () => {
    //curse.maven:better-foliage-228529:3335093
    const res = await requestWithSupertest.get(downloadUrl('better-foliage', '228529', '3335093', '.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("/download-binary/3335/93/BetterFoliage-2.6.5%252B368b50a-Fabric-1.16.5.jar")
  })

  test("Normal Jar that doesn't exist should return 404", async () => {
    //curse.maven:invalid-12345:12345
    const res = await requestWithSupertest.get(downloadUrl('invalid', '12345', '54321', '.jar'))
    expect(res.status).toStrictEqual(404)
  })
})

describe('Direct Download URL', () => {
  test('Normal zip should be correct', async () => {
    //curse.maven:rlcraft-285109:3575903
    const res = await requestWithSupertest.get(downloadUrl('rlcraft', '285109', '3575903', '.zip'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("https://edge.forgecdn.net/files/3575/903/RLCraft%201.12.2%20-%20Release%20v2.9.zip")
  })

  test("Normal Zip that doesn't exist should return 404", async () => {
    //curse.maven:invalid-12345:12345
    const res = await requestWithSupertest.get(downloadUrl('invalid', '12345', '54321', '.zip'))
    expect(res.status).toStrictEqual(404)
  })
})


describe('Classifier Download URL', () => {
  test('Classifier Jar should be correct', async () => {
    //curse.maven:ctm-267602:2809915-api-2809916:api
    const res = await requestWithSupertest.get(downloadUrl('ctm', '267602', '2809915-api-2809916', '-api.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("https://edge.forgecdn.net/files/2809/916/CTM-MC1.12.2-1.0.0.29-api.jar")
  })

  test('Classifier Jar w/ problamatic chars should be correct', async () => {
    //curse.maven:pehkui-319596:3577084-sources-dev-3577085:sources-dev
    const res = await requestWithSupertest.get(downloadUrl('pehkui', '319596', '3577084-sources-dev-3577085', '-sources-dev.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("/download-binary/3577/85/Pehkui-3.1.0%252B1.18.1-forge-sources-dev.jar")
  })

  test("Classifier Jar where original jar doesn't exist should return 404", async () => {
    //curse.maven:invalid-12345:54321-sources-54322:sources
    const res = await requestWithSupertest.get(downloadUrl('invalid', '12345', '54321', '-sources.jar'))
    expect(res.status).toStrictEqual(404)
  })
})

describe('POM Generation', () => {
  test('POM should be generated correctly', async () => {
    //curse.maven:jei-238222:2724420 - POM
    const res = await requestWithSupertest.get(downloadUrl('jei', '238222', '2724420', '.pom'))
    expect(res.status).toStrictEqual(200)
    expect(res.text).toStrictEqual(`<?xml version="1.0" encoding="UTF-8"?>
    <project xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd" xmlns="http://maven.apache.org/POM/4.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <modelVersion>4.0.0</modelVersion>
      <groupId>curse.maven</groupId>
      <artifactId>jei-238222</artifactId>
      <version>2724420</version>
    </project>`)
  })
})


afterAll(() => server.close())