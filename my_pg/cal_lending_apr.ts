process.env.ENV = 'prod';

import {
    LendingPoolCalculatorFactory,
} from '@alpaca-finance/alpaca-sdk/build-cjs/libs/calculators/LendingPoolCalculator'

import {vaults} from '@alpaca-finance/alpaca-sdk/build-cjs/constants/vault'
import {ethers, utils} from 'ethers'

const bscProvider = 'https://bsc-dataseed.binance.org';
async function main() {
    const provider = new ethers.providers.JsonRpcProvider(bscProvider);
    const lendingPoolCalculators = new LendingPoolCalculatorFactory(provider).create(...vaults);

    (await lendingPoolCalculators).forEach(cal => {
        console.log('Vault: ', cal.vault.name, 'Lending APR: ', utils.formatEther(cal.yearlyLendingAPR))
    })
}

main()
    .then(
        () => process.exit(0)
    )
    .catch(error => {
        console.error(error);
        process.exit(1);
    })