import { describe, test } from "@jest/globals"
import supertest from "supertest"
import server from "../src/index"

const requestWithSupertest = supertest(server)

describe('Index page', () => {
    test("GET / returns 200", async () => {
        const res = await requestWithSupertest.get("/")
        expect(res.status).toStrictEqual(200)
    });

    test("POST / returns 404", async () => {
        const res = await requestWithSupertest.post("/")
        expect(res.status).toStrictEqual(404)
    });
});

describe('Sub page', () => {
    test("GET /stats returns 200", async () => {
        const res = await requestWithSupertest.get("/stats")
        expect(res.status).toStrictEqual(200)
    });

    test("POST /stats returns 404", async () => {
        const res = await requestWithSupertest.post("/stats")
        expect(res.status).toStrictEqual(404)
    });
});

describe('Page doesnt exist', () => {
    test("GET /invalidpage returns 200", async () => {
        const res = await requestWithSupertest.get("/invalidpage")
        expect(res.status).toStrictEqual(404)
    });
});

afterAll(() => server.close())