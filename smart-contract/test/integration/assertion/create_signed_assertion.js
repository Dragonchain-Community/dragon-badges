const uuid = require("uuid/v4");

module.exports = async function (badger, options) {

    const txnId = uuid();
    
    const issuedOn = new Date().toISOString();

    const result = await badger.createSignedAssertion(
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

    const signedAssertionKey = `signedAssertion-${txnId}`;

    const assertionSignatureKey = `assertionSignature-${txnId}`;
    
    const imageKey = `image-${txnId}`;

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "createSignedAssertion",
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
            [signedAssertionKey]: {
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
              "badge": {
                "id": `http://127.0.0.1/badgeClass/${options.badgeClassEntityId}.json`,
                "type": "BadgeClass",
                "name": "Test Badge",
                "description": "A badge of badgery.",
                "criteria": {
                  "narrative": "The means by which a badgery badge is obtained is as follows..."
                },
                "image": `http://127.0.0.1/image/${options.badgeClassEntityId}.png`,
                "issuer": {
                  "id": `http://127.0.0.1/issuer/${options.issuerEntityId}.json`,
                  "type": "Issuer",
                  "name": "Test Issuer",
                  "description": "A badge issuer",
                  "url": "https://www.example.com",
                  "image": `http://127.0.0.1/image/${options.issuerEntityId}.png`,
                  "publicKey": `http://127.0.0.1/publicKey/${options.issuerEntityId}.json`,
                  "revocationList": `http://127.0.0.1/revocationList/${options.issuerEntityId}.json`
                }
              },
              "image": `http://127.0.0.1/image/${txnId}.png`,
              "verification": {
                "type": "SignedBadge",
                "creator": `http://127.0.0.1/publicKey/${options.issuerEntityId}.json`
              }
            },
            [signedAssertionKey]: result[signedAssertionKey],
            [assertionSignatureKey]: result[assertionSignatureKey],
            [imageKey]: result[imageKey]
        }
    };    
}