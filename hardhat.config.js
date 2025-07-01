require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    rsktestnet: {
      url: "https://public-node.testnet.rsk.co/",
      chainId: 31,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 60000000, // 60 Gwei
      gas: 6000000,
    },
  },
  etherscan: {
    apiKey: {
      rsktestnet: "YOUR_RSK_EXPLORER_API_KEY", // Get from explorer.testnet.rsk.io if available
    },
    customChains: [
      {
        network: "rsktestnet",
        chainId: 31,
        urls: {
          api: "https://explorer.testnet.rsk.io/api",
          browser: "https://explorer.testnet.rsk.io/"
        }
      }
    ]
  }
}; 