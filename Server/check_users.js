const db = require('./db');

async function check() {
    db.query("SELECT * FROM admins", (err, admins) => {
        if (err) console.error(err);
        console.log("Admins:", admins);

        db.query("SELECT * FROM users", (err, users) => {
            if (err) console.error(err);
            console.log("Users:", users);
            process.exit();
        });
    });
}

check();
