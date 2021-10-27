import { ethers, network } from "hardhat";
import {
    LendingPoolCalculator,
    LendingPoolCalculatorFactory,
  } from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/LendingPoolCalculator'

import { vaults } from '@alpaca-finance/alpaca-sdk/build-cjs/constants/vault'

async function main() {
    const provider = ethers.provider;
    const lendingPoolCalculators = await new LendingPoolCalculatorFactory(
        provider,
      ).create(...vaults)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })