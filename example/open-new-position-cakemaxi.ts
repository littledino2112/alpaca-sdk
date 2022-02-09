// Always set the ENV as 'prod' before importing the package.
// You can also consider using `dotenv` package to make this a bit cleaner.
process.env.ENV = 'prod'

import {
  Vault__factory,
  IWorker__factory,
  BEP20__factory,
} from '@alpaca-finance/alpaca-contract/typechain'
import { AddAllBaseTokenStrategy, TwoSideOptimalStrategy } from '@alpaca-finance/alpaca-sdk/build-cjs/entity/Strategy'
import { formatEther } from '@ethersproject/units'
import { ethers } from 'hardhat'
import { BigNumber, constants } from 'ethers'

async function main() {
  const OpenPositionGasLimit = BigNumber.from('2700000')
  const signer = (await ethers.getSigners())[0]
  console.log('signer', signer.address)

 // _____                               _                
 // |  __ \                             | |               
 // | |__) |_ _ _ __ __ _ _ __ ___   ___| |_ ___ _ __ ___ 
 // |  ___/ _` | '__/ _` | '_ ` _ \ / _ \ __/ _ \ '__/ __|
 // | |  | (_| | | | (_| | | | | | |  __/ ||  __/ |  \__ \
 // |_|   \__,_|_|  \__,_|_| |_| |_|\___|\__\___|_|  |___/
                                                        
  const vaultAddress = '0x7C9e73d4C71dae564d41F78d56439bB4ba87592f' // BUSD Vault
  const workerAddress = '0x41c1D9544ED9fa6b604ecAf7430b4CfDf883c46F' // BUSD CakeMaxiWorker
  const strategyAddress = '0x5cB454fc86068e710212FBECBC93070b90011F2B' // BUSD CakeMaxiWorker.strategies.StrategyAddAllBaseToken

  // `minFarmingToken` is for slippage control
  // by specifying it as `0` this would mean the user is willing to accept any amount of farmingToken received
  // this could proven to be dangerous for price manipulation attack, we put it as `0` here for the simplicity of the code example
  // Alpaca Finance frontend would calculate this value based on the current price with some percentage of slippage tolerance
  const minFarmingToken = '0'

  // In this example, we are opening a new position on Cake Single Staking Farm with BUSD as borrowing asset
  // We will farm this position with our 100 BUSD principal and we will borrow 100 BUSD from Alpaca Finance's Lending Vault
  // We do not supply any farming token (CAKE in this case) here.
  const inputBaseTokenAmount = ethers.utils.parseEther('100')
  const inputFarmingTokenAmount = ethers.utils.parseEther('0')
  const borrowAmount = ethers.utils.parseEther('100')

  //  _____                               
  // |  __ \                              
  // | |__) | __ ___ _ __   __ _ _ __ ___ 
  // |  ___/ '__/ _ \ '_ \ / _` | '__/ _ \
  // | |   | | |  __/ |_) | (_| | | |  __/
  // |_|   |_|  \___| .__/ \__,_|_|  \___|
  //                | |                   
  //                |_|                   
  const vault = Vault__factory.connect(vaultAddress, signer)
  const worker = IWorker__factory.connect(workerAddress, signer)
  const baseToken = BEP20__factory.connect(await worker.baseToken(), signer)
  const farmingToken = BEP20__factory.connect(
    await worker.farmingToken(),
    signer,
  )

  const baseTokenAllowance = await baseToken.allowance(
    signer.address,
    vaultAddress,
  )
  if (baseTokenAllowance.isZero()) {
    await baseToken.approve(vaultAddress, constants.MaxUint256)
  }
  const farmingTokenAllowance = await farmingToken.allowance(
    signer.address,
    vaultAddress,
  )
  if (!inputFarmingTokenAmount.isZero() && farmingTokenAllowance.isZero()) {
    await farmingToken.approve(vaultAddress, constants.MaxUint256)
  }
    
  // __          __        _    
  // \ \        / /       | |   
  //  \ \  /\  / /__  _ __| | __
  //   \ \/  \/ / _ \| '__| |/ /
  //    \  /\  / (_) | |  |   < 
  //     \/  \/ \___/|_|  |_|\_\

  const nextPositionID = await vault.nextPositionID()

  const encodedStrategyParams = inputFarmingTokenAmount.isZero() ?
    new AddAllBaseTokenStrategy().encodeStrategyParams('0', minFarmingToken) : 
    new TwoSideOptimalStrategy().encodeStrategyParams(inputBaseTokenAmount.toString(), minFarmingToken)
  const result = await vault.work(
    0,
    workerAddress,
    inputBaseTokenAmount,
    borrowAmount,
    '0',
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'bytes'],
      [strategyAddress, encodedStrategyParams],
    ),
    {
      gasLimit: OpenPositionGasLimit,
      value: '0',
    },
  )
  const newPosition = await vault.positionInfo(nextPositionID)
  console.log('newPosition value', newPosition[0].toString())
  console.log('newPosition debt', newPosition[1].toString())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
