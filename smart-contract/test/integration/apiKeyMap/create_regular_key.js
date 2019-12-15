const uuid = require("uuid/v4");

module.exports = async function (badger, options) {

    const txnId = uuid();
    
    const result = await badger.createAPIKey(txnId, {apiKey: {entityId: txnId, keyHash: {"salt": "salty1", "hash": "hashy1"}}});

    badger.client.updateSmartContractHeap(result);

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "apiKeyMap": {
                "master": {"salt": "salty", "hash": "hashy"},
                [txnId]: {"salt": "salty1", "hash": "hashy1"}
            }
        }
    };    
}