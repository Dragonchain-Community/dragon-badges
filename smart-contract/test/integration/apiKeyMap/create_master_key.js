const uuid = require("uuid/v4");

module.exports = async function (badger, options) {

    const txnId = uuid();
    
    const result = await badger.createMasterAPIKey(txnId, {key: {"salt": "salty", "hash": "hashy"}});

    badger.client.updateSmartContractHeap(result);

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "apiKeyMap": {
                "master": {"salt": "salty", "hash": "hashy"}
            }
        }
    };    
}