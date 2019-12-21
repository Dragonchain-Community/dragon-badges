const uuid = require("uuid/v4");

module.exports = async function (badger, options) {

    const txnId = uuid();
    
    const issuedOn = new Date().toISOString();

    const result = await badger.createHostedAssertion(
        txnId,     
        {
          "assertion": {
            "recipient": {
              "type": "email",
              "hashed": true,
              "salt": "deadsea",
              "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
            },
            "issuedOn": issuedOn,
            "badgeClassEntityId": options.badgeClassEntityId
          },
          "urlPrefix": "http://127.0.0.1"
        }
    );

    badger.client.updateSmartContractHeap(result);

    const assertionKey = `assertion-${txnId}`;

    const hostedAssertionKey = `hostedAssertion-${txnId}`;

    const imageKey = `image-${txnId}`;

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "createHostedAssertion",
              "entity": {                
                "entityId": txnId,
                "type": "Assertion",                
                "recipient": {
                  "type": "email",
                  "hashed": true,
                  "salt": "deadsea",
                  "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
                },
                "issuedOn": issuedOn,
                "badgeClassEntityId": options.badgeClassEntityId
              }
            },
            [assertionKey]: {                
              "entityId": txnId,
              "type": "Assertion",                
              "recipient": {
                "type": "email",
                "hashed": true,
                "salt": "deadsea",
                "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
              },
              "issuedOn": issuedOn,
              "badgeClassEntityId": options.badgeClassEntityId
            },
            [hostedAssertionKey]: result[hostedAssertionKey],
            [imageKey]: result[imageKey]
        }
    };    
}