/*
This module is to check the position growth/shrink over time. This will be the basis of when I decide to close/adjust my position

Basis of how this works
-	Given the 2 initial tokens, one base (B) and one for farming (A). Calculate the position health by taking into account the relative performance 
of taken A over B
-	There're 2 compounding effect here that need to be taken into account: the accumulating debt of token B (borrowing interest) and IL, which makes
the size of the position non-linear w.r.t the A/B price

Some governing formulas for this calculation:
- Accumulating debt: d = e^(r*t/365) in which r is the yearly interest rate, t is the borrowing time
- Total position growth (not take into account debt): total = (1 + a_b_ratio)^0.5	
	+ From this formula, one can see that if a grows 10% vs. b, the total position only grow by sqrt(1.1) - 1 = 4.8%. This is due to effect of AMM's 
	nature, assets are rebalanced so the number of token a decreases in my share of LPs
	+ Thanks to leverage, I can maintain the same growth on my equity (the initial capital) + farming profit
*/

// Inputs
function checkPositionGrowth(tokenA: string, tokenB: string, dateOpen: Date, equity: number, interestRate: number, positionID: number){
//	Step 1: Check the price of token A vs. B


//	Step 2: Calculate accumulating debt from dateOpen till now (maybe only check this when A/B exceeds a certain threshold)
}