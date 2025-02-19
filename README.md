# AdFriend - Browser Extension

<table style="width: 100%; background-color: #1a1e24; color: white; border-collapse: collapse;">
  <tr>
    <td style="width: 50%; padding: 0;">
      <img src="https://github.com/EdenianKnight/AdFriend/raw/main/icons/main.png" style="width: 100%; height: 100%; object-fit: cover;">
    </td>
    <td style="width: 50%; padding: 40px; vertical-align: middle;">
      <strong>AdFriend</strong> is a cross-platform, cross-browser extension designed to transform ad spaces into positive, interactive experiences. 
      It blocks intrusive ads and replaces them with customizable content such as motivational quotes, reminders, or widgets. 
      The extension also includes features like dark theme support, automatic incognito mode, and a reminder system to enhance user productivity and privacy.
    </td>
  </tr>
</table>

---

## Demo

[Watch Demo Video >](https://github.com/EdenianKnight/AdFriend/raw/main/AdFriend_Demo.webm)

---

## File Structure

```
AdFriend/
├── content-scripts/
│   ├── adBlocker.js
│   ├── contentReplacer.js
│   └── themeManager.js
├── reminder-system/
│   └── reminder.js
├── styles/
│   ├── popup.css
│   ├── themes.css
│   └── widget.css
├── utils/
│   └── adDetector.js
├── widgets/
│   └── widgetSystem.js
├── LICENSE
├── background.js
├── manifest.json
├── popup.html
└── popup.js
└── rules.json
```

---

## Features

### 1. **Ad Blocking and Replacement**
   - Detects and blocks intrusive ads using a predefined list of CSS selectors.
   - Replaces ads with positive content such as:
     - **Quotes**: Motivational quotes to inspire users.
     - **Reminders**: Helpful reminders like "Drink water!" or "Take a break."
     - **Custom Content**: User-defined text or messages.
     - **Widgets**: Interactive widgets like a clock, to-do list, notes, or timer.

### 2. **Dark Theme Support**
   - Allows users to toggle between light and dark themes for a comfortable browsing experience.
   - Automatically applies the theme based on user preference or system settings.

### 3. **Reminder System**
   - Enables users to set one-time or recurring reminders.
   - Displays notifications when reminders are triggered.
   - Supports snoozing and dismissing reminders.

### 4. **Widgets**
   - Provides interactive widgets to replace ad spaces:
     - **Clock**: Displays the current time and date.
     - **To-Do List**: Allows users to add and manage tasks.
     - **Notes**: Provides a textarea for quick notes, saved locally.
     - **Timer**: Allows users to set a countdown timer with notifications.

### 5. **Automatic Incognito Mode**
   - Automatically converts non-incognito tabs to incognito mode based on user settings.
   - Ensures private browsing without manual intervention.

---

## File Structure and Functionality

### 1. **`manifest.json`**
   - Defines the extension's metadata, permissions, and structure.
   - Specifies content scripts, background scripts, and popup UI.
   - Ensures cross-browser compatibility using the WebExtensions API.

### 2. **`popup.html`**
   - The user interface for the extension's popup.
   - Includes controls for:
     - Enabling/disabling the extension.
     - Toggling dark theme.
     - Selecting content type (quotes, reminders, custom content).
     - Enabling automatic incognito mode.
     - Adding and managing reminders.

### 3. **`popup.js`**
   - Handles user interactions in the popup UI.
   - Manages settings like dark theme, content type, and incognito mode.
   - Integrates with `chrome.storage.local` to save and load user preferences.
   - Initializes the `ReminderSystem` for managing reminders.

### 4. **`adDetector.js`**
   - Detects ad elements using a predefined list of CSS selectors.
   - Provides a static `isAd` method to check if an element matches any ad-related selector.

### 5. **`contentReplacer.js`**
   - Replaces detected ad elements with positive content or widgets.
   - Uses the `AdDetector` class to identify ads.
   - Dynamically updates content based on user settings (quotes, reminders, custom content, or widgets).

### 6. **`themeManager.js`**
   - Manages light and dark themes for the extension.
   - Applies the selected theme dynamically based on user preferences.
   - Listens for changes to the `darkMode` setting and updates the theme accordingly.

### 7. **`reminder.js`**
   - Manages the creation, storage, and triggering of reminders.
   - Uses `chrome.alarms` to schedule reminders and `chrome.notifications` to display them.
   - Supports one-time and recurring reminders.

### 8. **`widgetSystem.js`**
   - Creates and manages interactive widgets to replace ad spaces.
   - Supports the following widget types:
     - **Clock**: Displays the current time and date.
     - **To-Do List**: Allows users to add and manage tasks.
     - **Notes**: Provides a textarea for quick notes, saved locally.
     - **Timer**: Allows users to set a countdown timer with notifications.

### 9. **`styles/popup.css`**
   - Defines the styling for the extension's popup UI.
   - Ensures a clean, modern, and responsive design.
   - Supports light and dark themes using CSS variables.

### 10. **`styles/themes.css`**
   - Defines styles for light and dark themes.
   - Uses CSS variables for consistent theming.

### 11. **`styles/widget.css`**
   - Provides styles for widgets like clock, to-do list, notes, and timer.

### 12. **`background.js`**
   - Handles background tasks like managing alarms and notifications.
   - Listens for changes in settings and updates the extension accordingly.

### 13. **`rules.json`**
   - Contains declarative rules for blocking ads using the `declarativeNetRequest` API.

---

## Configuration

### Custom Content Settings
```json
{
  "quotes": {
    "enabled": true,
    "updateInterval": 3600,
    "source": "local"
  },
  "widgets": {
    "clock": true,
    "todo": true,
    "notes": true,
    "timer": true
  },
  "darkMode": "system",
  "reminderSound": "default"
}
```

----

## Requirements

- Node.js v14.0.0 or higher
- NPM v6.0.0 or higher
- Chrome/Firefox/Edge (latest versions)
- At least 50MB of free disk space

---

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 88 or later    |
| Firefox | 86 or later    |
| Edge    | 88 or later    |
| Opera   | 74 or later    |
| Brave   | 1.20 or later  |

---

## Performance Impact

AdFriend is designed to be lightweight and efficient:
- Memory usage: < 50MB
- CPU usage: < 1% on average
- Storage: < 10MB
- Network requests: Minimal (only for quote updates)

## Testing

The extension was rigorously tested using the following tools:
- **[CanYouBlockIt](https://canyoublockit.com/)**: Used to verify the effectiveness of ad blocking and replacement.
- **[AdBlock Tester](https://adblock-tester.com/)**: Used to test the extension's ability to block various types of ads across different websites.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AdFriend.git
   ```
2. Open your browser's extension management page:
   - **Chrome**: `chrome://extensions/`
   - **Firefox**: `about:addons`
   - **Edge**: `edge://extensions/`
3. Enable **Developer Mode**.
4. Click **Load Unpacked** and select the cloned repository folder.

---

## Usage

1. Click the AdFriend icon in the browser toolbar to open the popup.
2. Use the toggle switches to enable/disable the extension, dark theme, and automatic incognito mode.
3. Select the content type (quotes, reminders, custom content, or widgets) to replace ads.
4. Add reminders using the reminder form in the popup.
5. Enjoy a cleaner, more positive browsing experience!

---

## Troubleshooting

### Common Issues

1. **Extension not blocking ads**
   - Clear browser cache and reload the page
   - Check if other ad blockers are interfering
   - Verify the extension permissions

2. **Widgets not loading**
   - Check your internet connection
   - Reload the extension
   - Ensure JavaScript is enabled

3. **Reminders not working**
   - Allow notifications in browser settings
   - Check system notification settings
   - Verify background scripts are running
  
---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Authors

- **Solomon Okomowho** ([EdenianKnight](https://github.com/EdenianKnight))
- **Ebenezer Akinseinde** ([Ebendttl](https://github.com/Ebendttl))

---

## Acknowledgments

- Thanks to the [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions) for providing cross-browser compatibility.
- Inspired by the need for a more positive and productive browsing experience.

---

Happy browsing with AdFriend! 🚀
