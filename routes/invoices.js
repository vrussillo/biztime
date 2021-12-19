const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();

// GET all invoices
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

// GET invoice by ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't Find Invoice With ID Of ${id}`, 404);
    }
    return res.send({ invoices: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST, add new invoice
router.post("/", async (req, res, next) => {
  try {
    const { id, comp_code, amt, paid, add_date, paid_date } = req.body;

    const results = await db.query(
      `INSERT INTO invoices (id, comp_code, amt, paid, add_date, paid_date) 
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [id, comp_code, amt, paid, add_date, paid_date]
    );

    return res.status(201).json({ invoices: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Edit invoice by ID
router.put("/:id", async function (req, res, next) {
  try {
    let { amt, paid } = req.body;
    let id = req.params.id;
    let paidDate = null;

    const currResult = await db.query(
      `SELECT paid
           FROM invoices
           WHERE id = $1`,
      [id]
    );

    if (currResult.rows.length === 0) {
      throw new ExpressError(`No such invoice: ${id}`, 404);
    }

    const currPaidDate = currResult.rows[0].paid_date;

    if (!currPaidDate && paid) {
      paidDate = new Date();
    } else if (!paid) {
      paidDate = null;
    } else {
      paidDate = currPaidDate;
    }

    const result = await db.query(
      `UPDATE invoices
           SET amt=$1, paid=$2, paid_date=$3
           WHERE id=$4
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]
    );

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE invoice by id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
    return res.send({ message: "DELETED!" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
