class ThemeManager {
    constructor() {
      this.initialize();
    }
  
    async initialize() {
      const { darkMode } = await chrome.storage.local.get("darkMode");
      this.setTheme(darkMode);
      this.listenForChanges();
    }
  
    setTheme(isDark) {
      document.documentElement.className = isDark ? "dark-theme" : "light-theme";
    }
  
    listenForChanges() {
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.darkMode) {
          this.setTheme(changes.darkMode.newValue);
        }
      });
    }
  }
  
  new ThemeManager();