const uuid = require("uuid/v4");

module.exports = async function (badger) {

    const txnId = uuid();
    
    const result = await badger.createIssuer(
        txnId,     
        {
          "issuer": {            
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

    // Shouldn't get here //
}