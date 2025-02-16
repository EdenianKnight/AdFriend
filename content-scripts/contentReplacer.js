class ContentReplacer {
    constructor() {
      this.quotes = [
        "Believe you can and you're halfway there.",
        "Make today amazing!",
        "Small progress is still progress.",
      ];
      this.reminders = [
        "Time to stretch!",
        "Drink water!",
        "Take a deep breath.",
      ];
      this.initialize();
    }
  
    initialize() {
      this.replaceAds();
      this.observeChanges();
    }
  
    async replaceAds() {
      const settings = await chrome.storage.local.get([
        "contentType",
        "customContent",
      ]);
      document.querySelectorAll("*").forEach((element) => {
        if (AdDetector.isAd(element)) {
          this.replaceElement(element, settings);
        }
      });
    }
  
    replaceElement(adElement, settings) {
      const container = document.createElement("div");
      container.className = "adfriend-content";
      container.innerHTML = this.getContent(settings);
      adElement.replaceWith(container);
    }
  
    getContent(settings) {
      switch (settings.contentType) {
        case "quote":
          return this.quotes[Math.floor(Math.random() * this.quotes.length)];
        case "reminder":
          return this.reminders[
            Math.floor(Math.random() * this.reminders.length)
          ];
        case "custom":
          return settings.customContent || this.quotes[0];
        default:
          return this.quotes[0];
      }
    }
  
    observeChanges() {
      new MutationObserver(() => this.replaceAds()).observe(document, {
        childList: true,
        subtree: true,
      });
    }
  
    async replaceElement(adElement, settings) {
      const container = document.createElement("div");
      container.className = "adfriend-content";
  
      if (settings.contentType === "widget") {
        const widgetSystem = new WidgetSystem();
        await widgetSystem.createWidget(settings.widgetType, container);
      } else {
        container.innerHTML = this.getContent(settings);
      }
  
      adElement.replaceWith(container);
    }
  }