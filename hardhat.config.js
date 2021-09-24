require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const INFURA_KEY = process.env.INFURA_KEY;
const pp = process.env.RINKEBY_PP;

module.exports = {
  solidity: "0.6.2",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
      accounts: [pp],
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      accounts: [pp],
    },
  },
  paths: {
    artifacts: "./app/src/ethereum",
  },
};
