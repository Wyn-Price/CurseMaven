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


describe('Classifier Download URL', () => {
  test('Classifier Jar should be correct', async () => {
    //curse.maven:ctm-267602:2809915:api
    const res = await requestWithSupertest.get(downloadUrl('jei', '267602', '2809915', '-api.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("https://edge.forgecdn.net/files/2809/916/CTM-MC1.12.2-1.0.0.29-api.jar")
  })

  test('Classifier Jar w/ problamatic chars should be correct', async () => {
    //curse.maven:pehkui-319596:3577084:sources-dev
    const res = await requestWithSupertest.get(downloadUrl('pehkui', '319596', '3577084', '-sources-dev.jar'))
    expect(res.status).toStrictEqual(302)
    expect(res.headers['location']).toStrictEqual("/download-binary/3577/85/Pehkui-3.1.0%252B1.18.1-forge-sources-dev.jar")
  })

  test("Classifier Jar where original jar doesn't exist should return 404", async () => {
    //curse.maven:invalid-12345:12345:sources
    const res = await requestWithSupertest.get(downloadUrl('invalid', '12345', '54321', '-sources.jar'))
    expect(res.status).toStrictEqual(404)
  })

  test("Classifier Jar where classifier doesn't exist should return 404", async () => {
    //curse.maven:jei-238222:2724420:api
    const res = await requestWithSupertest.get(downloadUrl('jei', '238222', '2724420', '-api.jar'))
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

describe('/test/ should run correctly.', () => {
  //curse.maven:jei-238222:2724420
  test("When the file ID exists ", async () => {
    const res = await requestWithSupertest.get("/test/238222/2724420")
    expect(res.status).toStrictEqual(200)
    expect(res.text).toStrictEqual(`
Raw URL: /test/238222/2724420

ProjectId: 238222
FileId: 2724420
Classifier: undefined

Download URL: https://addons-ecs.forgesvc.net/api/v2/addon/238222/file/2724420/download-url
GET: https://addons-ecs.forgesvc.net/api/v2/addon/238222/file/2724420/download-url
Resolved 200 https://edge.forgecdn.net/files/2724/420/jei_1.12.2-4.15.0.281.jar

Result: https://edge.forgecdn.net/files/2724/420/jei_1.12.2-4.15.0.281.jar`.substring(1)
    )
  })

  test("When the file ID exists and the classifier exists", async () => {
    //curse.maven:ctm-267602:2809915:api
    const res = await requestWithSupertest.get("/test/267602/2809915/api")
    expect(res.status).toStrictEqual(200)
    expect(res.text).toStrictEqual(`
Raw URL: /test/267602/2809915/api

ProjectId: 267602
FileId: 2809915
Classifier: api

Download URL: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809915/download-url
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809915/download-url
Resolved 200 https://edge.forgecdn.net/files/2809/915/CTM-MC1.12.2-1.0.0.29.jar
ParsedID: 2809915
Searching for classifier: 'api'
Jarname: '/CTM-MC1.12.2-1.0.0.29-api.jar'
Tries: 10

Iteration: 0
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809916/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/916/CTM-MC1.12.2-1.0.0.29-api.jar' -> true

Result: https://edge.forgecdn.net/files/2809/916/CTM-MC1.12.2-1.0.0.29-api.jar`.substring(1)
    )
  })

  test("When the file ID exists but the doesn't classifier exists", async () => {
    //curse.maven:ctm-267602:2809915:source
    const res = await requestWithSupertest.get("/test/267602/2809915/source")
    expect(res.status).toStrictEqual(200)
    expect(res.text).toStrictEqual(`
Raw URL: /test/267602/2809915/source

ProjectId: 267602
FileId: 2809915
Classifier: source

Download URL: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809915/download-url
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809915/download-url
Resolved 200 https://edge.forgecdn.net/files/2809/915/CTM-MC1.12.2-1.0.0.29.jar
ParsedID: 2809915
Searching for classifier: 'source'
Jarname: '/CTM-MC1.12.2-1.0.0.29-source.jar'
Tries: 10

Iteration: 0
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809916/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/916/CTM-MC1.12.2-1.0.0.29-api.jar' -> false

Iteration: 1
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809917/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/917/CharacterStatsClassic_2.3.zip' -> false

Iteration: 2
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809918/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/918/Worthless 8.2.5 build 1.zip' -> false

Iteration: 3
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809919/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/919/Minecolonies Getting Started-2.22.23.zip' -> false

Iteration: 4
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809920/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/920/mcgs-1.14.4-2.22.23-Server.zip' -> false

Iteration: 5
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809921/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/921/HMM1.6.0.jar' -> false

Iteration: 6
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809922/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/922/DrinkIt-1.05-retail.zip' -> false

Iteration: 7
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809923/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/923/karadeniz mod beta2.jar' -> false

Iteration: 8
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809924/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/924/peeandballsgaming.zip' -> false

Iteration: 9
GET: https://addons-ecs.forgesvc.net/api/v2/addon/267602/file/2809925/download-url
    Response: 200
    'https://edge.forgecdn.net/files/2809/925/[1.6.1.1]_Heliomalt_XVM_v.1.17.3.exe' -> false


CLASSIFIER WAS NOT FOUND`.substring(1)
    )
  })

  test("When file ID doesn't exist ", async () => {
    //curse.maven:invalid-12345:12345
    const res = await requestWithSupertest.get("/test/12345/12345")
    expect(res.status).toStrictEqual(200)
    expect(res.text).toStrictEqual(`
Raw URL: /test/12345/12345

ProjectId: 12345
FileId: 12345
Classifier: undefined

Download URL: https://addons-ecs.forgesvc.net/api/v2/addon/12345/file/12345/download-url
GET: https://addons-ecs.forgesvc.net/api/v2/addon/12345/file/12345/download-url
Resolved 404 


JAR WAS NOT FOUND`.substring(1)
    )
  })
})

afterAll(() => server.close())