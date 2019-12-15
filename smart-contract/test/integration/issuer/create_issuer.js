const uuid = require("uuid/v4");

module.exports = async function (badger) {

    const txnId = uuid();
    
    const result = await badger.createIssuer(
        txnId,     
        {
          "issuer": {
            "name": "Test Issuer",
            "description": "A badge issuer",
            "url": "https://www.example.com",
            "imageObject": {
              "extension": "png",
              "contentType": "image/png",
              "data": "imagedata..."              
            }            
          }
        }
    );

    badger.client.updateSmartContractHeap(result);

    const entityKey = `issuer-${txnId}`;
    
    const imageKey = `image-${txnId}`;

    const imageObject = {
      "extension": "png",
      "contentType": "image/png",
      "data": "imagedata..."              
    };

    const publicKeyKey = `publicKey-${txnId}`;

    const publicKey = {
        "type": "CryptographicKey",
        "issuerEntityId": txnId,
        "publicKeyPem": badger.config.publicKey
    };

    const revocationListKey = `revocationList-${txnId}`;

    const revocationList = {
      "issuerEntityId": txnId,
      "type": "RevocationList",            
      "revokedAssertions": []
    };

    return {
        "requestTxnId": txnId,        
        "actual": result,        
        "expected": {
            "response": {
              "type": "createIssuer",
              "entity": {
                "entityId": txnId,
                "type": "Issuer",
                "name": "Test Issuer",
                "description": "A badge issuer",
                "url": "https://www.example.com",
              }
            },
            [entityKey]: {
              "entityId": txnId,
              "type": "Issuer",
              "type": "Issuer",
                "name": "Test Issuer",
                "description": "A badge issuer",
                "url": "https://www.example.com",
            },
            [publicKeyKey]: publicKey,
            [revocationListKey]: revocationList,
            [imageKey]: imageObject
        }
    };    
}