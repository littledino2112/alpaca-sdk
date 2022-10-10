import {ethers, utils} from "ethers"
import spooky_abi from "../contracts_abi/spooky_router.json"

const fantom_rpc =  "https://rpc.ankr.com/fantom/";
const spooky_router = "0xf491e7b69e4244ad4002bc14e878a34207e38c29";
const alpaca_addr = "0xad996a45fd2373ed0b10efa4a8ecb9de445a4302";
const wftm_addr = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

const provider = new ethers.providers.JsonRpcProvider(fantom_rpc);

const spooky = new ethers.Contract(spooky_router, spooky_abi, provider);

// Compute exchange rate btw ALPACA and FTM
function get_alpaca_ftm_price(){
  const token_pair = [alpaca_addr,wftm_addr];
  spooky.getAmountsOut(utils.parseUnits("1"), token_pair).then((rate: number[]) => {
      console.log(`${new Date()} - ${utils.formatEther(rate[0])} ALPACA = ${utils.formatEther(rate[1])} FTM`);
  })
}

// Get estimated gas price
// provider.getGasPrice().then((gas: any) => {
//   console.log(`Gas price: ${utils.formatEther(gas)} FTM`);
// })  
const interval = 0.1*60*1000;
setInterval(get_alpaca_ftm_price, interval);