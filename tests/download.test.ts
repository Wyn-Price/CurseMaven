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

  test('Sequential Classifiers should be correct', async () => {
    //curse.maven:ctm-267602:2809915-api:api
    const res = await requestWithSupertest.get(downloadUrl('ctm', '267602', '2809915-api', '-api.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("https://edge.forgecdn.net/files/2809/916/CTM-MC1.12.2-1.0.0.29-api.jar")
  })

  test('Stacked Sequential Classifiers should be correct', async () => {
    //curse.maven:jer-240630:2452535-deobf-sources-api:api
    const res = await requestWithSupertest.get(downloadUrl('jer', '240630', '2452535-deobf-sources-api', '-api.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("https://edge.forgecdn.net/files/2452/538/JustEnoughResources-1.12-0.8.2.20-api.jar")
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