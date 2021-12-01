const db = require("../db");
const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();

// GET all companies
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (err) {
    return next(err);
  }
});

// GET company by Code
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
      code,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't Find Company With Code Of ${code}`, 404);
    }
    return res.send({ companies: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// POST, add new company
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    const results = await db.query(
      `INSERT INTO companies (code, name, description) 
               VALUES ($1, $2, $3)
               RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ companies: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Edit company by Code
router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const results = await db.query(
      `UPDATE companies SET name=$1, description=$2 WHERE code=$3
               RETURNING code, name, description`,
      [name, description, code]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't Find Company With Code Of ${code}`, 404);
    }
    return res.status(200).json({ companies: results.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// DELETE company by Code
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const results = await db.query(`DELETE FROM companies WHERE code=$1`, [
      code,
    ]);
    return res.send({ message: "DELETED!" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
