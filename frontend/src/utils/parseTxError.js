const CONTRACT_MESSAGES = {
  "Already registered": "You are already registered in the system.",
  "Cannot refer yourself": "You cannot use your own address as a referrer.",
  "Referrer must be registered": "The referrer address is not registered. Use a valid referrer or leave it empty.",
  "Must be registered first": "Please register in the system before performing this action.",
  "Must be registered": "Please register in the system before performing this action.",
  "Min mint is $10": "Minimum mint amount is $10 USDT equivalent.",
  "Max mint is $10000": "Maximum mint amount is $10,000 USDT equivalent.",
  "BNB amount must be greater than 0": "Please enter a BNB amount greater than zero.",
  "Min stake is $10": "Minimum stake value is $10 USDT equivalent.",
  "Max stake is $10000": "Maximum stake value is $10,000 USDT equivalent.",
  "Invalid stake index": "Invalid stake selected. Please refresh and try again.",
  "Stake is not active": "This stake is no longer active.",
  "No rewards to claim": "No rewards available to claim yet.",
  "365-day cycle not complete": "Your 365-day investment cycle is not complete yet. Withdrawal is not available.",
  "Insufficient balance to spin": "Insufficient token balance to spin the wheel.",
  "Invalid or expired coupon": "This coupon code is invalid or has already been used.",
  "Coupon limit reached": "You have reached the monthly coupon limit (max 3 per month).",
  "Not qualified": "You do not meet the requirements for this reward yet.",
  "Already claimed": "You have already claimed this reward.",
  "Salary claimable once per month": "Monthly salary can only be claimed once every 30 days.",
  "Insufficient USDT reserves": "Contract has insufficient USDT for this payout. Please contact support.",
  "Insufficient contract USDT balance": "Contract has insufficient USDT liquidity for this sale.",
  "Insufficient token reserves": "Contract has insufficient token reserves. Please try again later.",
  "Insufficient BNB balance": "Contract has insufficient BNB balance for this transaction.",
  "execution reverted": "Transaction was rejected by the smart contract.",
};

const ACTION_HINTS = {
  mint: "Mint failed. Ensure you are registered and deposit between $10 and $10,000 USDT equivalent.",
  stake: "Staking failed. Ensure you are registered and stake between $10 and $10,000 USDT equivalent.",
  register: "Registration failed. Check your referrer address or try again.",
  approve: "Token approval failed. Please try again in your wallet.",
  sell: "Sell failed. Check your token balance and try again.",
  claim: "Claim failed. Rewards may not be available yet.",
  unstake: "Withdrawal failed. The 365-day cycle may not be complete yet.",
  coupon: "Coupon could not be applied. Check the code and your monthly limit.",
  wheel: "Lucky wheel spin failed. Check your token balance and try again.",
  rank: "Rank bonus claim failed. Verify you meet all rank requirements.",
  salary: "Monthly salary claim failed. Verify requirements and 30-day cooldown.",
};

function collectErrorStrings(err, depth = 0) {
  if (!err || depth > 5) return [];
  const parts = [];
  if (typeof err === "string") parts.push(err);
  if (err.reason) parts.push(err.reason);
  if (err.shortMessage) parts.push(err.shortMessage);
  if (err.message) parts.push(err.message);
  if (err.data?.message) parts.push(err.data.message);
  if (err.error?.message) parts.push(err.error.message);
  if (err.info?.error?.message) parts.push(err.info.error.message);
  if (err.cause) parts.push(...collectErrorStrings(err.cause, depth + 1));
  return parts;
}

function matchContractMessage(text) {
  if (!text) return null;
  for (const [key, friendly] of Object.entries(CONTRACT_MESSAGES)) {
    if (text.includes(key)) return friendly;
  }
  return null;
}

function isUserRejection(text) {
  const lower = (text || "").toLowerCase();
  return (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request") ||
    lower.includes("action_rejected") ||
    lower.includes("4001")
  );
}

function isInsufficientFunds(text) {
  const lower = (text || "").toLowerCase();
  return lower.includes("insufficient funds") || lower.includes("insufficient balance for gas");
}

function isCallException(text) {
  const lower = (text || "").toLowerCase();
  return (
    lower.includes("missing revert data") ||
    lower.includes("call_exception") ||
    lower.includes("execution reverted") ||
    lower.includes("estimateGas")
  );
}

/**
 * Convert raw wallet / contract errors into short user-friendly messages.
 * @param {unknown} err
 * @param {string} defaultMsg
 * @param {{ action?: string }} [context]
 */
export function parseTxError(err, defaultMsg = "Transaction failed. Please try again.", context = {}) {
  if (!err) return defaultMsg;

  const allText = collectErrorStrings(err).join(" ");

  if (isUserRejection(allText)) {
    return "Transaction cancelled. You rejected the request in your wallet.";
  }

  if (isInsufficientFunds(allText)) {
    return "Insufficient BNB for gas fees. Add test BNB to your wallet and try again.";
  }

  const contractMsg = matchContractMessage(allText);
  if (contractMsg) return contractMsg;

  if (isCallException(allText)) {
    if (context.action && ACTION_HINTS[context.action]) {
      return ACTION_HINTS[context.action];
    }
    return "Transaction could not be completed. Please check your inputs, registration status, and wallet balance, then try again.";
  }

  // Return a trimmed plain message if it's already short and readable
  const primary = err.reason || err.shortMessage || err.message;
  if (primary && primary.length <= 120 && !primary.includes("0x") && !primary.includes("action=")) {
    return primary;
  }

  return defaultMsg;
}

export const BNB_PRICE_USD = 600;

export function getMintUsdValue(amount, method) {
  const parsed = parseFloat(amount) || 0;
  return method === "BNB" ? parsed * BNB_PRICE_USD : parsed;
}

export function validateMintAmount(amount, method) {
  const usd = getMintUsdValue(amount, method);
  if (usd < 10) {
    const minBnb = (10 / BNB_PRICE_USD).toFixed(4);
    return method === "BNB"
      ? `Minimum mint is $10 (~${minBnb} BNB at $${BNB_PRICE_USD}/BNB).`
      : "Minimum mint amount is $10 USDT.";
  }
  if (usd > 10000) {
    const maxBnb = (10000 / BNB_PRICE_USD).toFixed(2);
    return method === "BNB"
      ? `Maximum mint is $10,000 (~${maxBnb} BNB at $${BNB_PRICE_USD}/BNB).`
      : "Maximum mint amount is $10,000 USDT.";
  }
  return null;
}
