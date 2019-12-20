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

    const imageKey = `image-${txnId}`;

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "createAssertion",
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
              "@context": "https://w3id.org/openbadges/v2",
              "type": "Assertion",
              "id": `urn:uuid:${txnId}`,
              "recipient": {
                "type": "email",
                "hashed": true,
                "salt": "deadsea",
                "identity": "sha256$c7ef86405ba71b85acd8e2e95166c4b111448089f2e1599f42fe1bba46e865c5"
              },
              "issuedOn": issuedOn,
              "badge": `http://127.0.0.1/badgeClass/${options.badgeClassEntityId}.json`,
              "image": `http://127.0.0.1/image/${txnId}.png`,
              "verification": {
                "type": "SignedBadge",
                "creator": `http://127.0.0.1/publicKey/${options.issuerEntityId}.json`
              }
            },
            [assertionKey]: result[assertionKey],
            [imageKey]: result[imageKey]
        }
    };    
}