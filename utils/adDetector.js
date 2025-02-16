class AdDetector {
    static selectors = [
      'div[id*="google_ad"]',
      "ins.adsbygoogle",
      '[id*="banner"]',
      '[class*="ad-"]',
      '[class*="advertisement"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="ad"]',
    ];
  
    static isAd(element) {
      return this.selectors.some((selector) => element.matches(selector));
    }
  }