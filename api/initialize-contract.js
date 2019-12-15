const util = require('util');
const dcsdk = require('dragonchain-sdk');
const uuid = require('uuid/v4');

const config = require('./config');

const helper = require('./dragon-badges-helper');

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const initialize = async () => {
    const client = await dcsdk.createClient();

    const key = uuid();
    
    console.log("Creating master API key...");

    // Create an authority //
    const requestTxn = await client.createTransaction({
        transactionType: config.contractTxnType,
        payload: {
            "method": "createMasterAPIKey",
            "parameters": {
                "keyHash": helper.getHashedPassword(key)
            }
        }        
    })

    console.log(util.inspect(requestTxn, false, null, true));

    // Wait for response to be written to a block //
    await sleep(6000);

    const apiKeyMap = await client.getSmartContractObject({key:`apiKeyMap`, smartContractId: config.contractId});
    
    console.log(`Master API Key (ONLY DISPLAYED ONCE): ${key}`);
}

initialize().then(() => {console.log("Done.")}).catch((err) => {console.error(err)});

