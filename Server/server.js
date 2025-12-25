const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const voterRoutes = require("./routes/voters");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
// Root Route
// ✅ FRONTEND STATIC FILES
app.use(express.static(path.join(__dirname, "../Client")));
app.use(express.static(path.join(__dirname, "../Client/Login")));
app.use(express.static(path.join(__dirname, "../Client/Admin")));
app.use(express.static(path.join(__dirname, "../Client/User")));

// ✅ FRONTEND PAGES
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/Login/login.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/Login/login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/Admin/admin.html"));
});

app.get("/user", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/User/user.html"));
});

// ✅ API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/voters", voterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
