// Always set the ENV as 'prod' before importing the package.
// You can also consider using `dotenv` package to make this a bit cleaner.
process.env.ENV = 'prod'

import { LendingPoolCalculatorFactory } from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/LendingPoolCalculator'
import { FarmingPoolCalculatorFactory } from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/FarmingPoolCalculator'
import { StakingPoolCalculatorFactory } from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/StakingPoolCalculator'

import { vaults } from '@alpaca-finance/alpaca-sdk/build-cjs/constants/vault'
import {
  ibStakingPoolsV2,
  debtStakingPoolsV2,
  expiredStakingPoolsV2,
} from '@alpaca-finance/alpaca-sdk/build-cjs/constants/stakingPool'
import { availableFarmingPools } from '@alpaca-finance/alpaca-sdk/build-cjs/constants/farmingPool'

import { ethers, BigNumber } from 'ethers'
import { formatEther, parseEther } from '@ethersproject/units'
import { WeiPerEther, Zero } from '@ethersproject/constants'
import axios from 'axios'
import { FarmingPoolConfig } from '@alpaca-finance/alpaca-sdk/build-cjs/entity'

async function main() {
const tradingFeeData = await axios('https://api.alpacafinance.org/v1/internal/tradingFee')
const tradingFees = tradingFeeData.data.data.tradingFees
  const provider = new ethers.providers.JsonRpcProvider(
    'https://bsc-dataseed.binance.org',
  )
  const lendingPoolCalculators = await new LendingPoolCalculatorFactory(
    provider,
  ).create(...vaults)
  const debtStakingPoolCalculators = await new StakingPoolCalculatorFactory(
    provider,
  ).create(...debtStakingPoolsV2)
  const farmingPoolConfig : FarmingPoolConfig = availableFarmingPools.find((e: any)=> e.key === 'pcs-busd-alpaca') as FarmingPoolConfig
  const farmingPoolCalculators = await new FarmingPoolCalculatorFactory(
    provider,
  )
    .setLendingPoolCalculators(lendingPoolCalculators)
    .setDebtStakingPoolCalculators(debtStakingPoolCalculators)
    .create(farmingPoolConfig)
  
  const yieldFarmingApr = farmingPoolCalculators[0].farmingWorkerCalculators[1].yearlyFarmRewardApr(WeiPerEther)
  
  const [dexName, pairName] = farmingPoolCalculators[0].farmingPool.name.split(' ')
  const pairTradingFee = tradingFees.find((e : any) => e.name === pairName)
  const yearlyTradingFeeApr =  parseEther(pairTradingFee.dailyTradingFeesApr).mul(365)
  const maxTotalAprAt1xLeverage = farmingPoolCalculators[0].maxTotalAprAt1xLeverage(yearlyTradingFeeApr)

  console.log('Farm:', farmingPoolCalculators[0].farmingPool.name)
  console.log('LP Address:', farmingPoolCalculators[0].farmingPool.lpAddress)
  console.log('Yield Farming APR:', formatEther(yieldFarmingApr))
  console.log('Trading Fee APR:', formatEther(yearlyTradingFeeApr))
  console.log('Total APR:', formatEther(maxTotalAprAt1xLeverage))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
