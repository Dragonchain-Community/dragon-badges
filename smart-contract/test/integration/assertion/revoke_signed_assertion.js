const uuid = require("uuid/v4");

module.exports = async function (badger, options) {

    const txnId = uuid();
    
    const assertion = {...await badger.getHeapObject({key: `assertion-${options.assertionEntityId}`})};

    const badgeClass = {...await badger.getHeapObject({key: `badgeClass-${assertion.badgeClassEntityId}`})};

    const issuerEntityId = badgeClass.issuerEntityId;

    const revocationList = {...await badger.getHeapObject({key: `revocationList-${issuerEntityId}`})};

    const result = await badger.revokeSignedAssertion(
        txnId,     
        {
          "revocation": {
            "assertionEntityId": options.assertionEntityId,
            "reason": "Bad stuff."   
          }
        }
    );

    badger.client.updateSmartContractHeap(result);

    revocationList.revokedAssertions.push({
        "id": `urn:uuid:${options.assertionEntityId}`,
        "revocationReason": "Bad stuff."   
      });

    const revocationListKey = `revocationList-${revocationList.issuerEntityId}`;

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "revokeSignedAssertion",
              "revocation": {                
                "id": `urn:uuid:${options.assertionEntityId}`,
                "revocationReason": "Bad stuff."
              }
            },
            [revocationListKey]: revocationList
        }
    };    
}