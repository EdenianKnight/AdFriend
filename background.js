class ContentReplacer {
    constructor() {
      this.adPatterns = [
        'div[id*="ad"]',
        'div[class*="ad"]',
        'iframe[src*="ad"]',
        'img[src*="ad"]',
      ];
      this.setupListeners();
    }
  
    setupListeners() {
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "complete") {
          this.processTab(tabId);
        }
      });
    }
  
    async processTab(tabId) {
      try {
        const tab = await chrome.tabs.get(tabId);
  
        // Skip invalid tabs
        if (!tab || !tab.url) {
          console.warn("Skipping invalid tab:", tab);
          return;
        }
  
        // Skip non-web pages (chrome://, file://, error pages)
        if (
          tab.url.startsWith("chrome://") ||
          tab.url.startsWith("file://") ||
          tab.url.startsWith("about:") ||
          tab.url.startsWith("edge://") ||
          tab.status === "unloaded"
        ) {
          console.warn("Skipping non-web or unloaded page:", tab.url);
          return;
        }
  
        // Execute script safely
        await chrome.scripting.executeScript({
          target: { tabId, allFrames: true },
          func: this.replaceAds,
          args: [this.adPatterns],
        });
      } catch (error) {
        console.error(`Failed to process tab ${tabId}:`, error);
      }
    }
  
    replaceAds(patterns) {
      patterns.forEach((pattern) => {
        document.querySelectorAll(pattern).forEach((element) => {
          element.style.display = "none";
        });
      });
    }
  }
  
  class IncognitoManager {
    constructor() {
      this.setupListeners();
      this.checkSettings();
    }
  
    async checkSettings() {
      const { incognitoAuto } = await chrome.storage.local.get("incognitoAuto");
      if (incognitoAuto) {
        this.enableIncognitoMode();
      }
    }
  
    setupListeners() {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.incognitoAuto?.newValue) {
          this.enableIncognitoMode();
        }
      });
  
      chrome.tabs.onCreated.addListener(async (tab) => {
        const { incognitoAuto } = await chrome.storage.local.get("incognitoAuto");
        if (incognitoAuto && !tab.incognito) {
          this.convertToIncognito(tab);
        }
      });
    }
  
    async convertToIncognito(tab) {
      try {
        if (!tab.url) {
          console.warn("Skipping tab with no URL.");
          return;
        }
  
        const newWindow = await chrome.windows.create({
          url: tab.pendingUrl || tab.url,
          incognito: true,
        });
  
        // Delay tab removal to avoid "No tab with id" errors
        setTimeout(() => {
          chrome.tabs.remove(tab.id, () => {
            if (chrome.runtime.lastError) {
              console.warn(
                "Tab removal error:",
                chrome.runtime.lastError.message
              );
            }
          });
        }, 500);
      } catch (error) {
        console.error("Incognito conversion failed:", error);
      }
    }
  
    enableIncognitoMode() {
      chrome.windows.getAll({ populate: true }, (windows) => {
        windows.forEach((window) => {
          if (!window.incognito) {
            window.tabs.forEach((tab) => {
              chrome.tabs.get(tab.id, (existingTab) => {
                if (!chrome.runtime.lastError && existingTab) {
                  this.convertToIncognito(existingTab);
                } else {
                  console.warn("Skipping tab that no longer exists:", tab.id);
                }
              });
            });
          }
        });
      });
    }
  }
  
  // Initialize extension settings on install/update
  chrome.runtime.onInstalled.addListener(() => {
    const defaults = {
      darkMode: false,
      contentType: "quote",
      customContent: "",
      reminders: [],
      incognitoAuto: false,
    };
    chrome.storage.local.set(defaults);
  });
  
  // Initialize components
  const contentReplacer = new ContentReplacer();
  const incognitoManager = new IncognitoManager();