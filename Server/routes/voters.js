const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../db");
const auth = require("../middleware/auth");



// ===== GET VOTERS LIST =====
// ===== GET VOTERS WITH PAGINATION =====
router.get("/", auth(["admin","user"]), (req, res) => {
  const admin_id = req.user.admin_id;

  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT * FROM voters
    WHERE admin_id = ?
    ORDER BY voter_id
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [admin_id, limit, offset], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});



// ===== MULTER =====
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith(".xlsx")) {
      return cb(new Error("Only .xlsx files allowed"));
    }
    cb(null, true);
  }
});

// ===== REQUIRED COLUMNS =====
const REQUIRED_COLUMNS = [
  "Name",
  "Sr No",
  "House No",
  "Gender",
  "Age",
  "Mobile",
  "Address",
  "EPIC"
];

// ===== EXCEL UPLOAD =====
// ===== EXCEL UPLOAD (NO SKIP VERSION) =====
router.post(
  "/upload",
  auth(["admin"]),
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.json({ success: false, message: "No file uploaded" });
      }

      const workbook = XLSX.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      if (data.length === 0) {
        return res.json({ success: false, message: "Excel is empty" });
      }

      // Column check (still REQUIRED)
      const excelColumns = Object.keys(data[0]);
      const missingCols = REQUIRED_COLUMNS.filter(
        col => !excelColumns.includes(col)
      );

      if (missingCols.length > 0) {
        return res.json({
          success: false,
          message: "Invalid Excel format",
          missingColumns: missingCols
        });
      }

      const admin_id = req.user.admin_id;
      const values = [];

      for (let row of data) {
        // 🔧 AUTO FIX DATA
        const name = row["Name"] || "UNKNOWN";
        const genderRaw = (row["Gender"] || "").toString().toLowerCase();
        let gender = "Other";
        if (genderRaw.startsWith("m")) gender = "Male";
        else if (genderRaw.startsWith("f")) gender = "Female";

        const age = isNaN(row["Age"]) ? 0 : Number(row["Age"]);
        const mobile = row["Mobile"] ? row["Mobile"].toString() : null;
        const epic = row["EPIC"] || "NA";

        values.push([
          admin_id,
          name,
          row["Sr No"] || null,
          row["House No"] || null,
          gender,
          age,
          mobile,
          row["Address"] || null,
          epic
        ]);
      }

      const sql = `
        INSERT IGNORE INTO voters
        (admin_id, name, sr_no, house_no, gender, age, mobile, address, epic)
        VALUES ?

      `;

      db.query(sql, [values], err => {
        if (err) {
          console.error(err);
          return res.json({ success: false, message: "DB insert failed" });
        }

        res.json({
          success: true,
          message: "Excel uploaded successfully",
          totalRows: data.length,
          insertedRows: values.length
        });
      });
    } catch (err) {
      console.error(err);
      res.json({ success: false, message: "Upload failed" });
    }
  }
);



// ===== GENDER GRAPH =====
router.get("/stats/gender", auth(["admin","user"]), (req, res) => {
  const admin_id = req.user.admin_id;

  const sql = `
    SELECT gender, COUNT(*) as count
    FROM voters
    WHERE admin_id = ?
    GROUP BY gender
  `;

  db.query(sql, [admin_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});



// ===== AGE GROUP GRAPH =====
router.get("/stats/age", auth(["admin","user"]), (req, res) => {
  const admin_id = req.user.admin_id;

  const sql = `
    SELECT
      CASE
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 35 THEN '26-35'
        WHEN age BETWEEN 36 AND 50 THEN '36-50'
        ELSE '50+'
      END as age_group,
      COUNT(*) as count
    FROM voters
    WHERE admin_id = ?
    GROUP BY age_group
  `;

  db.query(sql, [admin_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});



// ===== SURNAME GRAPH =====
router.get("/stats/surname", auth(["admin","user"]), (req, res) => {
  const admin_id = req.user.admin_id;

  const sql = `
    SELECT 
      SUBSTRING_INDEX(name, ' ', 1) AS surname,
      COUNT(*) AS count
    FROM voters
    WHERE admin_id = ?
    GROUP BY surname
    ORDER BY count DESC
    LIMIT 10
  `;

  db.query(sql, [admin_id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


// ===== SEARCH VOTERS (SERVER SIDE) =====
router.get("/search", auth(["admin","user"]), (req, res) => {
  const admin_id = req.user.admin_id;
  const q = `%${req.query.q || ""}%`;

  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const sql = `
    SELECT *
    FROM voters
    WHERE admin_id = ?
      AND (
        name LIKE ?
        OR mobile LIKE ?
        OR epic LIKE ?
      )
    ORDER BY voter_id
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [admin_id, q, q, q, limit, offset], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


module.exports = router;
