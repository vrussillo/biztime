// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompanies;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO companies (code, name, description) VALUES ('sup', 'sony', 'blahblah') RETURNING  code, name, description`
  );
  testCompanies = result.rows[0];
});

let testInvoices;
beforeEach(async () => {
  const result = await db.query(
    `INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date) VALUES (1, 'sup', 200, 't', '2021-12-01', null) RETURNING id, comp_code, amt, paid, add_date, paid_date`
  );
  testInvoices = result.rows[0];
});

afterEach(async () => {
  await db.query(`DELETE FROM invoices`);
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", () => {
  test("Get a list with one invoice", async () => {
    const res = await request(app).get("/invoices");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: [
        {
          id: 1,
          comp_code: "sup",
          amt: 200,
          paid: true,
          add_date: "2021-12-01T08:00:00.000Z",
          paid_date: null,
        },
      ],
    });
  });
});

describe("GET /invoices/:id", () => {
  test("Gets a single invoice by id", async () => {
    const res = await request(app).get(`/invoices/${testInvoices.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: {
        id: 1,
        comp_code: "sup",
        amt: 200,
        paid: true,
        add_date: "2021-12-01T08:00:00.000Z",
        paid_date: null,
      },
    });
  });
  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).get(`/invoices/0`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /invoices", () => {
  test("Creates a single invoice", async () => {
    const res = await request(app).post("/invoices").send({
      id: 3,
      comp_code: "sup",
      amt: 200,
      paid: true,
      add_date: "2021-12-01T08:00:00.000Z",
      paid_date: null,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      invoices: {
        id: 3,
        comp_code: "sup",
        amt: 200,
        paid: true,
        add_date: "2021-12-01T08:00:00.000Z",
        paid_date: null,
      },
    });
  });
});

describe("PUT /invoices/:id", () => {
  test("Updates a single invoice", async () => {
    const res = await request(app).put(`/invoices/${testInvoices.id}`).send({
      id: 1,
      comp_code: "sup",
      amt: 400,
      paid: false,
      add_date: "2021-12-01T08:00:00.000Z",
      paid_date: null,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoices: {
        id: 1,
        comp_code: "sup",
        amt: 400,
        paid: false,
        add_date: "2021-12-01T08:00:00.000Z",
        paid_date: null,
      },
    });
  });

  test("Responds with 404 for invalid id", async () => {
    const res = await request(app).put(`/invoices/0`).send({
      id: 0,
      comp_code: "sup",
      amt: 200,
      paid: true,
      add_date: "2021-12-01T08:00:00.000Z",
      paid_date: null,
    });
    expect(res.statusCode).toBe(404);
  });
});

// describe("DELETE /invoices/:id", () => {
//   test("Deletes a single invoice", async () => {
//     const res = await request(app).delete(`/invoice/${testInvoices.id}`);
//     expect(res.statusCode).toBe(404);
//     expect(res.body).toEqual({ message: "DELETED!" });
//   });
// });
