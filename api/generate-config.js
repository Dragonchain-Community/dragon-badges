const fs = require('fs');
const uuidv4 = require("uuid/v4");

const salt = uuidv4();

const config = {
    contractTxnType: "dragonbadges",
    contractId: "",
    urlPrefix: "http://127.0.0.1:3050",
    port: 3050
}

fs.writeFile('config.json', JSON.stringify(config), (err) => {    
    if (err) throw err;
    
    console.log('Config written.');
});
