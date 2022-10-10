"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
require("@nomiclabs/hardhat-ethers");
require("hardhat-typechain");
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
};
//# sourceMappingURL=hardhat.config.js.map