const fs = require('fs');
const dns = require('dns');
require('dotenv').config({ path: 'Server/.env' });

const host = process.env.DB_HOST || "NOT_SET";

let output = `HOST: ${host}\n`;

dns.lookup(host, (err, address, family) => {
    if (err) {
        output += `DNS Check: Failed - ${err.message}\n`;
    } else {
        output += `DNS Check: Success - IP: ${address}\n`;
    }
    fs.writeFileSync('debug_output.txt', output);
});
