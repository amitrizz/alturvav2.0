import React, { useEffect, useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { isMobileDevice, isInAppBrowser } from "../utils/mobile";
import "./InstallApp.css";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function InstallApp({ variant = "banner" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const dismissedKey = "btc3_install_dismissed";
    if (sessionStorage.getItem(dismissedKey)) {
      setDismissed(true);
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("btc3_install_dismissed", "1");
  };

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      setShowIosGuide(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed || dismissed) return null;

  const showOnMobile = isMobileDevice();
  const canShowAndroidInstall = Boolean(deferredPrompt);
  const showIosHint = isIOS() && showOnMobile;

  if (!showOnMobile && !canShowAndroidInstall && variant === "banner") return null;
  if (variant === "banner" && !showOnMobile && !canShowAndroidInstall) return null;

  if (variant === "button") {
    return (
      <>
        <button type="button" className="install-app-btn" onClick={handleInstall}>
          <Download size={16} />
          Install App
        </button>
        {showIosGuide && <IosInstallModal onClose={() => setShowIosGuide(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="install-app-banner">
        <div className="install-app-banner-icon">
          <Download size={20} />
        </div>
        <div className="install-app-banner-text">
          <strong>Install BTC3.0 App</strong>
          <span>
            {canShowAndroidInstall
              ? "Add to home screen for quick access — works like a mobile app."
              : showIosHint
                ? "Add to your iPhone home screen for app-like experience."
                : "Install on your phone for faster access."}
          </span>
        </div>
        <button type="button" className="install-app-banner-cta" onClick={handleInstall}>
          {canShowAndroidInstall ? "Install" : "How to"}
        </button>
        <button type="button" className="install-app-banner-close" onClick={handleDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
      {showIosGuide && <IosInstallModal onClose={() => setShowIosGuide(false)} />}
    </>
  );
}

function IosInstallModal({ onClose }) {
  const inApp = isInAppBrowser();

  return (
    <div className="install-app-modal-overlay" onClick={onClose}>
      <div className="install-app-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="install-app-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <h3>Install on your phone</h3>

        {inApp ? (
          <p className="install-app-modal-note">
            Open this page in <strong>Safari</strong> or <strong>Chrome</strong> first (tap ⋯ → Open in Browser), then follow the steps below.
          </p>
        ) : null}

        <div className="install-app-steps">
          <div className="install-app-step">
            <span className="install-app-step-num">1</span>
            <div>
              <strong>iPhone (Safari)</strong>
              <p>Tap <Share size={14} className="inline-icon" /> Share → <Plus size={14} className="inline-icon" /> Add to Home Screen</p>
            </div>
          </div>
          <div className="install-app-step">
            <span className="install-app-step-num">2</span>
            <div>
              <strong>Android (Chrome)</strong>
              <p>Tap menu ⋮ → <strong>Install app</strong> or <strong>Add to Home screen</strong></p>
            </div>
          </div>
        </div>

        <button type="button" className="install-app-modal-done" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
