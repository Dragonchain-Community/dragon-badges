const fs = require('fs');
const assert = require("assert");
const badger = require("../../src/contract/dragon-badges");

const test = {
    apiKeyMap: {
        create_master_key: require("./apiKeyMap/create_master_key")
    },    
    issuer: {
        create_issuer_missing_data: require("./issuer/create_issuer_missing_data"),
        create_issuer: require("./issuer/create_issuer")
    }
};

badger.client = {
    heap: {},

    updateSmartContractHeap: function (data) {
        this.heap = {...this.heap, ...data};

        // Write current heap to file //
        fs.writeFileSync(__dirname + '/post-run-heap.json', JSON.stringify(this.heap, null, 2), (err) => {    
            if (err) throw err;
        });
    },

    getSmartContractObject: async function (options) {

        if (this.heap[options.key])
        {
            return {
                "status": 200,
                "response": JSON.stringify(this.heap[options.key]),
                "ok": true
            }
        }

        return {
            "status": 404,
            "response": JSON.stringify({"error":{"type":"NOT_FOUND","details":"The requested resource(s) cannot be found."}}),
            "ok": false
          };          
    }
};

(async () => {

    // Setup keys //
    badger.config.publicKey = await fs.readFileSync("./testKey.public", "utf8");
    badger.config.privateKey = await fs.readFileSync("./testKey.private", "utf8");

    // +++ API KEY MAP +++ //
    // Assert master API key created //
    let result = await test.apiKeyMap.create_master_key(badger);

    assert.deepStrictEqual(result.actual, result.expected, "Create Master API Key");

    
    // +++ ISSUER TESTS +++ //

    // Assert creating issuer with missing required data fails //
    await assert.rejects(test.issuer.create_issuer_missing_data(badger), "Create Issuer: Missing Data");

    // Assert issuer created //
    result = await test.issuer.create_issuer(badger);

    assert.deepStrictEqual(result.actual, result.expected, "Create Issuer");

    let issuer = await badger.getHeapObject({"key": `issuer-${result.requestTxnId}`});


    console.log("Tests passed!");

})();