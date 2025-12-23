const bcrypt = require("bcryptjs");

console.log("Admin:", bcrypt.hashSync("admin123", 10));
console.log("User :", bcrypt.hashSync("user123", 10));
