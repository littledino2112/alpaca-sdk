import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "hardhat-deploy";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://weathered-billowing-resonance.bsc.quiknode.pro/f98a121ea42a5f4b6b3a7ef736880f1db9018146/",
      },
      //   chainId: 31337,
      //   gas: 12000000,
      //   blockGasLimit: 0x1fffffffffffff,
      //   allowUnlimitedContractSize: true,
      //   timeout: 1800000,
      //   accounts: [
      //     {
      //       privateKey: process.env.LOCAL_PRIVATE_KEY_1,
      //       balance: '10000000000000000000000',
      //     },
      //     {
      //       privateKey: process.env.LOCAL_PRIVATE_KEY_2,
      //       balance: '10000000000000000000000',
      //     },
      //     {
      //       privateKey: process.env.LOCAL_PRIVATE_KEY_3,
      //       balance: '10000000000000000000000',
      //     },
      //     {
      //       privateKey: process.env.LOCAL_PRIVATE_KEY_4,
      //       balance: '10000000000000000000000',
      //     },
      //   ],
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545",
      accounts: [process.env.BSC_TESTNET_PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.BSC_MAINNET_RPC,
      accounts: [process.env.BSC_MAINNET_PRIVATE_KEY],
      timeout: 1800000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    version: "0.6.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "istanbul",
      outputSelection: {
        "*": {
          "": ["ast"],
          "*": [
            "evm.bytecode.object",
            "evm.deployedBytecode.object",
            "abi",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.sourceMap",
            "metadata",
          ],
        },
      },
    },
  },
  paths: {
    sources: "./contracts/6",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "./typechain",
    target: process.env.TYPECHAIN_TARGET || "ethers-v5",
  },
};
