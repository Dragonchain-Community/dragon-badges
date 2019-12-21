const uuid = require("uuid/v4");

module.exports = async function (badger, options) {

    const txnId = uuid();
    
    const assertion = {...await badger.getHeapObject({key: `assertion-${options.assertionEntityId}`})};

    const issuerEntityId = assertion.badge.issuer.id.split("/").pop().replace(".json", "");

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
        "id": options.assertionEntityId,
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
                "id": options.assertionEntityId,
                "revocationReason": "Bad stuff."
              }
            },
            [revocationListKey]: revocationList
        }
    };    
}