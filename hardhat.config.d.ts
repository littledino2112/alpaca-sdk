import { config as dotEnvConfig } from "dotenv"
dotEnvConfig()

import "@nomiclabs/hardhat-ethers";
import "hardhat-typechain"

module.exports = {
  defaultNetwork: "mainnet",
  networks: {
    mainnet: {
      url: process.env.FANTOM_MAINNET_RPC,
      accounts: [process.env.FANTOM_MAINNET_PRIVATE_KEY],
      timeout: 1800000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}
