// Always set the ENV as 'prod' before importing the package.
// You can also consider using `dotenv` package to make this a bit cleaner.
process.env.ENV = 'prod'

import {
  LendingPoolCalculatorFactory,
} from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/LendingPoolCalculator'
import { vaults } from '@alpaca-finance/alpaca-sdk/build-cjs/constants/vault'
import { ethers } from 'ethers'
import { formatEther } from '@ethersproject/units'

async function main() {
  const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org')
  const lendingPoolCalculators = await new LendingPoolCalculatorFactory(
    provider,
  ).create(...vaults)
  
  lendingPoolCalculators.forEach(cal => {
    console.log('Vault:', cal.vault.name, 'Lending APR:', formatEther(cal.yearlyLendingAPR))
  })
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })