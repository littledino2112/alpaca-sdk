/*
    Understand what the worker contract got to offer: what functions, properties that I can use

    A few questions I have in mind now:
    - Is work contract specific for a lyf pool? for example, does the ALPACA-FTM have a seperate Worker
    contract
*/

process.env.ENV = 'prod'

import {
    Vault__factory,
    IWorker__factory,
    BEP20__factory,
    PancakePair__factory,
    SpookyToken__factory,
} from '@alpaca-finance/alpaca-contract/typechain'

import {ethers} from 'hardhat'
import {utils, constants} from 'ethers'
import { getVaultByAddress, vaults } from '@alpaca-finance/alpaca-sdk/build-cjs/constants/vault'
import SpookyPairAbi from "../contracts_abi/SpookyPair.json"

async function main(){
    // Get signer
    const signer = (await ethers.getSigners())[0]

    // Vault address
    const vaultAddr = "0xc1018f4Bba361A1Cc60407835e156595e92EF7Ad" // FTM vault
    const workerAddr = "0xB82B93FcF1818513889c0E1F3628484Ce5017A14" // ALPACA-WFTM worker

    // Create a worker
    const worker = IWorker__factory.connect(workerAddr, signer)

    // Check farming and base token info
    // console.log("Farming token: ", (await worker.farmingToken()))
    // console.log("Base token: ", (await worker.baseToken()))

    // Check position health using worker's interface
    // const positionID = 4071
    // const positionHealth = (await worker.health(positionID))
    // console.log("Position health: ", utils.formatEther(positionHealth))

    // Create BEP20 token contract from address returned from Worker
    const baseToken = BEP20__factory.connect(
        await worker.baseToken(),
        signer
    )
    console.log("Base token: ", await baseToken.symbol())
    const farmingToken = BEP20__factory.connect(
        await worker.farmingToken(),
        signer
    )
    console.log("Farming token: ", await farmingToken.symbol())

    // Token allowance
    // ? Does this action require tx fee
    // * The use of this function is to basically check if an address is allowed to use
    // * the fund in the wallet. If not, an approve action is required
    // * allowance do not require tx fee
    // * As expected, approve requires tx fee
    const baseTokenAllowance = await baseToken.allowance(
        signer.address,
        vaultAddr
    )
    console.log("Allowance for vault address: ", !baseTokenAllowance.isZero())
    if (baseTokenAllowance.isZero()){
        await baseToken.approve(vaultAddr, constants.MaxUint256)
    }

    // Connect to Spooky contract
    const lpAddr = await worker.lpToken()
    console.log("LP token address on Spooky: ", lpAddr)
    const spookyPair = new ethers.Contract(lpAddr, SpookyPairAbi, signer)
    const token0 = await spookyPair.token0()
    const reserves = await spookyPair.getReserves()
    console.log("Token0: ", token0)
    console.log("Token0 reserve: ", utils.formatEther(reserves[0]))
    console.log("Token1 reserve: ", utils.formatEther(reserves[1]))
}

main()
.then(
    () => process.exit(0)
)