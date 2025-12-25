const db = require('./db');
const fs = require('fs');

const outFile = 'creds.txt';

db.query("SELECT * FROM admins", (err, admins) => {
    let output = "";
    if (err) {
        output += "Admin Error: " + JSON.stringify(err) + "\n";
    } else {
        output += "Admins: " + JSON.stringify(admins) + "\n";
    }

    db.query("SELECT * FROM users", (err, users) => {
        if (err) {
            output += "User Error: " + JSON.stringify(err) + "\n";
        } else {
            output += "Users: " + JSON.stringify(users) + "\n";
        }

        fs.writeFileSync(outFile, output);
        console.log("Done");
        process.exit();
    });
});
