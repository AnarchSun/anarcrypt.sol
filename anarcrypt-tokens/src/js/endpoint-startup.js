const web3 = require("@solana/web3.js");
(async () => {
  const solana = new web3.Connection("https://practical-cosmological-wildflower.solana-mainnet.quiknode.pro/e11ad9915e9b11a26f08c3beb6250b8e59e75388/");
  console.log(await solana.getSlot());
})();