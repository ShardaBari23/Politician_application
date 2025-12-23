const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const SECRET = "ELECTION_SECRET_KEY";

router.post("/login", (req, res) => {
  const { mobile, password } = req.body;

  // 1️⃣ Check Admin
  const adminSql = "SELECT * FROM admins WHERE mobile=?";
  db.query(adminSql, [mobile], (err, adminResult) => {
    if (err) return res.status(500).json(err);

    if (adminResult.length > 0) {
      const admin = adminResult[0];
      const ok = bcrypt.compareSync(password, admin.password);

      if (!ok)
        return res.json({ success: false, message: "Wrong password" });

      const token = jwt.sign(
        { admin_id: admin.admin_id, role: "admin" },
        SECRET,
        { expiresIn: "1h" }
      );

      return res.json({
        success: true,
        role: "admin",
        token
      });
    }

    // 2️⃣ Check User
    const userSql = "SELECT * FROM users WHERE mobile=?";
    db.query(userSql, [mobile], (err, userResult) => {
      if (err) return res.status(500).json(err);

      if (userResult.length === 0)
        return res.json({ success: false, message: "User not found" });

      const user = userResult[0];
      const ok = bcrypt.compareSync(password, user.password);

      if (!ok)
        return res.json({ success: false, message: "Wrong password" });

      const token = jwt.sign(
        {
          admin_id: user.admin_id,
          user_id: user.user_id,
          role: "user"
        },
        SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        success: true,
        role: "user",
        token
      });
    });
  });
});

module.exports = router;
