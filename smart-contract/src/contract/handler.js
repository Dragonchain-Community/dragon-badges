const dcsdk = require("dragonchain-sdk");
const badger = require("./dragon-badges");

const log = (string) => console.error(`STDERR: ${string}`);

module.exports = async input => {
  // Parse the request //
  let inputObj = JSON.parse(input);

  try {
    badger.client = await dcsdk.createClient();

    let output = await Reflect.apply(
      badger[inputObj.payload.method],
      badger,
      [
        inputObj.header.txn_id,
        inputObj.payload.parameters
      ]
    );

    return output;
        
  } catch (exception)    
  {
      // Write the exception to STDERR
      log(exception);

      return {"exception": exception};  
  }
}