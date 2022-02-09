// Always set the ENV as 'prod' before importing the package.
// You can also consider using `dotenv` package to make this a bit cleaner.
process.env.ENV = 'prod'

import {
  Vault__factory,
  IWorker__factory,
  BEP20__factory,
  PancakePair__factory,
} from '@alpaca-finance/alpaca-contract/typechain'
import {
  AddAllBaseTokenStrategy,
  TwoSideOptimalStrategy,
} from '@alpaca-finance/alpaca-sdk/build-cjs/entity/Strategy'
import {
  FarmInteractionCalculator,
  IData,
} from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/FarmInteractionCalculator'
import { formatEther } from '@ethersproject/units'
import { ethers, network } from 'hardhat'
import { BigNumber, constants } from 'ethers'

async function main() {
  const OpenPositionGasLimit = BigNumber.from('2700000')
  const signer = (await ethers.getSigners())[0]

  // _____                               _
  // |  __ \                             | |
  // | |__) |_ _ _ __ __ _ _ __ ___   ___| |_ ___ _ __ ___
  // |  ___/ _` | '__/ _` | '_ ` _ \ / _ \ __/ _ \ '__/ __|
  // | |  | (_| | | | (_| | | | | | |  __/ ||  __/ |  \__ \
  // |_|   \__,_|_|  \__,_|_| |_| |_|\___|\__\___|_|  |___/

  const vaultAddress = '0x7C9e73d4C71dae564d41F78d56439bB4ba87592f' // BUSD Vault
  const workerAddress = '0x4BfE9489937d6C0d7cD6911F1102c25c7CBc1B5A' // ALPACA-BUSD PancakeswapWorker
  const strategyAddress = '0x3fC149995021f1d7AEc54D015Dad3c7Abc952bf0' // ALPACA-BUSD PancakeswapWorker.strategies.StrategyAddTwoSidesOptimal

  // In this example, we are opening a new position on ALPACA-BUSD PancakeSwap Farm with BUSD as borrowing asset
  // We will farm this position with our 100 BUSD and 100 ALPACA principal and we will borrow 100 BUSD from Alpaca Finance's Lending Vault
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

  const lpPair = PancakePair__factory.connect(await worker.lpToken(), signer)
  const token0 = await lpPair.token0()
  const reserves = await lpPair.getReserves()

  const slippageCalculator = new FarmInteractionCalculator({
    _data: {
      baseAddress: baseToken.address,
      farmAddress: farmingToken.address,
      baseReserve: token0 == baseToken.address ? reserves[0] : reserves[1],
      farmReserve: token0 == farmingToken.address ? reserves[0] : reserves[1],
      lpTotalSupply: await lpPair.totalSupply(),
      tradingFeeBps: BigNumber.from(9975),
    },
  })

  // `minLPAmount` is for slippage control
  const { minLpAmount } = slippageCalculator.calculateOpenPositionParams({
    inputBaseAmount: inputBaseTokenAmount,
    inputFarmAmount: inputFarmingTokenAmount,
    borrowingBaseAmount: borrowAmount,
    slippageBps: BigNumber.from(25),
  })

  // __          __        _
  // \ \        / /       | |
  //  \ \  /\  / /__  _ __| | __
  //   \ \/  \/ / _ \| '__| |/ /
  //    \  /\  / (_) | |  |   <
  //     \/  \/ \___/|_|  |_|\_\

  const nextPositionID = await vault.nextPositionID()

  const encodedStrategyParams =
    new TwoSideOptimalStrategy().encodeStrategyParams(
      inputFarmingTokenAmount.toString(),
      minLpAmount.toString(),
    )

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

  // Fully Close and Convert All this position
  const positionId = (await vault.nextPositionID()).sub(1)
  const closeStrategyAddress = '0x9Da5D593d08B062063F81913a08e04594F84d438'
  const { minReceivingBaseAmount } =
    slippageCalculator.calculateEntirelyCloseLiquidateAllPositionParams({
      equityInBase: await worker.health(positionId),
      debtInBase: borrowAmount,
      slippageBps: BigNumber.from(25),
    })

  const encodeType = ['uint256']
  const data = [minReceivingBaseAmount]

  const closeStrategyEncodedParams = ethers.utils.defaultAbiCoder.encode(
    encodeType,
    data,
  )
  await vault.work(
    positionId,
    workerAddress,
    inputBaseTokenAmount,
    '0',
    ethers.constants.MaxUint256,
    ethers.utils.defaultAbiCoder.encode(
      ['address', 'bytes'],
      [closeStrategyAddress, closeStrategyEncodedParams],
    ),
    {
      gasLimit: OpenPositionGasLimit,
      value: '0',
    },
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
