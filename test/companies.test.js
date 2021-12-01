// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompanies;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('lol', 'nintendo', 'games') RETURNING  code, name, description`
  );
  testCompanies = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get("/companies");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompanies] });
  });
});

describe("GET /companies/:code", () => {
  test("Gets a single company by code", async () => {
    const res = await request(app).get(`/companies/${testCompanies.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: testCompanies });
  });
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/companies/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app)
      .post("/companies")
      .send({ code: "xxx", name: "Moog", description: "synths" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      companies: {
        code: expect.any(String),
        name: "Moog",
        description: "synths",
      },
    });
  });
});

describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app)
      .put(`/companies/${testCompanies.code}`)
      .send({ code: "xxx", name: "Moog", description: "synths" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      companies: {
        code: testCompanies.code,
        name: "Moog",
        description: "synths",
      },
    });
  });
  test("Responds with 404 for invalid code", async () => {
    const res = await request(app)
      .put(`/companies/0`)
      .send({ code: "xxx", name: "Moog", description: "synths" });
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompanies.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "DELETED!" });
  });
});
