const fs = require('fs');
const assert = require("assert");
const badger = require("../../src/contract/dragon-badges");

const test = {
    apiKeyMap: {
        create_master_key: require("./apiKeyMap/create_master_key"),
        create_regular_key: require("./apiKeyMap/create_regular_key")
    },    
    issuer: {
        create_issuer_missing_data: require("./issuer/create_issuer_missing_data"),
        create_issuer: require("./issuer/create_issuer")
    },
    badgeClass: {
        create_badge_class: require("./badgeClass/create_badgeClass")
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

    result = await test.apiKeyMap.create_regular_key(badger);

    assert.deepStrictEqual(result.actual, result.expected, "Create Regular API Key");

    
    // +++ ISSUER TESTS +++ //

    // Assert creating issuer with missing required data fails //
    await assert.rejects(test.issuer.create_issuer_missing_data(badger), "Create Issuer: Missing Data");

    // Assert issuer created //
    result = await test.issuer.create_issuer(badger);

    assert.deepStrictEqual(result.actual, result.expected, "Create Issuer");

    let issuer = await badger.getHeapObject({"key": `issuer-${result.requestTxnId}`});

    // Assert badge class created //
    result = await test.badgeClass.create_badge_class(badger, {issuerEntityId: issuer.entityId});

    assert.deepStrictEqual(result.actual, result.expected, "Create Badge Class");

    let badgeClass = await badger.getHeapObject({"key": `badgeClass-${result.requestTxnId}`});

    await badger.createSignedAssertion("1234", {
        assertion: {
            "recipient": {
                "type": "email",
                "hashed": true,
                "salt": "deadsea",
                "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
            },
            badgeClassEntityId: badgeClass.entityId
        }, 
        urlPrefix: "http://127.0.0.1"

    });

    console.log("Tests passed!");

})();