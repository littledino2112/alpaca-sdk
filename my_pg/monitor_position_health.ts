process.env.ENV = 'prod'

import {
    Vault__factory,
    IWorker__factory,
    BEP20__factory,
    PancakePair__factory,
} from '@alpaca-finance/alpaca-contract/typechain'

import {
    TwoSideOptimalStrategy,
} from '@alpaca-finance/alpaca-sdk/build-cjs/entity/Strategy'

import {
    FarmInteractionCalculator,
    IData,
} from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/FarmInteractionCalculator'

import {utils} from 'ethers'
import { ethers, network } from 'hardhat'
import { BigNumber, constants } from 'ethers'

async function get_position_health() {
    const OpenPositionGasLimit = BigNumber.from('2700000')
    const signer = (await ethers.getSigners())[0]
    // console.log("Signer: ", signer);

    // Parameters
    // const vaultAddress = '0x7C9e73d4C71dae564d41F78d56439bB4ba87592f' // BUSD vault
    const vaultAddress = '0xc1018f4Bba361A1Cc60407835e156595e92EF7Ad' // FTM vault
    const workderAddress = '0x4BfE9489937d6C0d7cD6911F1102c25c7CBc1B5A'
    const strategyAddress = '0x3fC149995021f1d7AEc54D015Dad3c7Abc952bf0'

    // Prepare
    const vault = Vault__factory.connect(vaultAddress, signer)
    // console.log("Connected Vault (FTM): ", vault)

    // Get position info
    const positionId = 4071;
    var position_data: any[] = new Array();
    (await vault.positionInfo(positionId)).forEach( res => {
        position_data.push(utils.formatEther(res))
        // console.log("result = ", utils.formatEther(res))
    })

    // Position health
    const position_debt = position_data[1]/position_data[0]
    console.log("Position debt ratio: ", position_debt);
}

const interval = 5*60*1000  // in ms
setInterval(get_position_health, interval)