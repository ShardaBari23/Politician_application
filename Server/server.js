const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const voterRoutes = require("./routes/voters");

const app = express();

app.use(cors());
app.use(express.json());
// Root Route
// Root Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/index.html"));
});

// ✅ API ROUTES FIRST
app.use("/api/auth", authRoutes);
app.use("/api/voters", voterRoutes);

// ✅ FRONTEND LAST
app.use(express.static(path.join(__dirname, "../Client")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
