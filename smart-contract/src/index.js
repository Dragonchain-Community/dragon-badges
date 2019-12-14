const getStdin = require("get-stdin");
const handler = require("./contract/handler");

async function main() {
  const string = await getStdin(); // <-- get input from the blockchain contract invoker.
  const input = JSON.parse(string);
  try {
    const res = await handler(input); // <-- execute your smart contract.
    process.stdout.write(JSON.stringify(res)); // <-- give the output back to the invoker to modify any state.
  } catch (err) {
    return console.error(err); // <-- log any errors.
  }
}

main().catch(console.error);
