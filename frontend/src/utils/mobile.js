export function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 0 && window.innerWidth < 1024);
}

export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /FBAN|FBAV|Instagram|Line\/|Twitter|Telegram|WhatsApp/i.test(ua);
}

export function isMetaMaskBrowser() {
  if (typeof navigator === "undefined") return false;
  return /MetaMask/i.test(navigator.userAgent || "");
}

export function isTrustWalletBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Trust/i.test(navigator.userAgent || "");
}

export function isWalletInAppBrowser() {
  return isMetaMaskBrowser() || isTrustWalletBrowser() || (hasInjectedProvider() && isMobileDevice());
}

export function hasInjectedProvider() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function needsHttpsForWallets() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return window.location.protocol !== "https:"
    && host !== "localhost"
    && host !== "127.0.0.1";
}
