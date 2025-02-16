class AdBlocker {
    constructor() {
      this.adSelectors = [
        'div[id*="google_ad"]',
        "ins.adsbygoogle",
        'div[id*="banner"]',
        'div[class*="ad-"]',
        'div[class*="advertisement"]',
      ];
      this.init();
    }
  
    async init() {
      document.addEventListener("DOMContentLoaded", async () => {
        this.settings = await this.getSettings();
        this.removeAds();
        this.observeDOM();
      });
    }
  
    async getSettings() {
      return new Promise((resolve) => {
        chrome.storage.local.get(["contentType"], (result) => {
          resolve(result.contentType || "quote");
        });
      });
    }
  
    removeAds() {
      const ads = document.querySelectorAll(this.adSelectors.join(","));
      ads.forEach((ad) => this.replaceWithContent(ad));
    }
  
    replaceWithContent(adElement) {
      if (!adElement || !adElement.parentNode) return;
  
      const replacement = document.createElement("div");
      replacement.className = "adfriend-content";
  
      if (this.settings === "reminder") {
        this.insertReminder(replacement);
      } else {
        this.insertQuote(replacement);
      }
  
      adElement.parentNode.replaceChild(replacement, adElement);
    }
  
    insertQuote(element) {
      const quotes = [
        "Believe you can and you're halfway there.",
        "Every day is a new beginning.",
        "Make today amazing!",
      ];
      element.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }
  
    insertReminder(element) {
      const reminders = [
        "Time to stretch!",
        "Drink some water!",
        "Take a deep breath.",
      ];
      element.textContent =
        reminders[Math.floor(Math.random() * reminders.length)];
    }
  
    observeDOM() {
      if (!document.body) {
        console.error("document.body is not available for MutationObserver.");
        return;
      }
  
      let timeout;
      const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.removeAds(), 500);
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }
  
  new AdBlocker();