document.addEventListener("DOMContentLoaded", () => {
    const masterToggle = document.getElementById("masterToggle");
    const themeToggle = document.getElementById("themeToggle");
    const contentType = document.getElementById("contentType");
    const customContent = document.getElementById("customContent");
    const customContentBox = document.getElementById("customContentBox");
    const incognitoToggle = document.getElementById("incognitoToggle");
  
    chrome.storage.local.get(null, (settings) => {
      masterToggle.checked = settings.enabled ?? true;
      themeToggle.checked = settings.darkMode ?? false;
      contentType.value = settings.contentType ?? "quote";
      customContent.value = settings.customContent ?? "";
      incognitoToggle.checked = settings.incognitoAuto ?? false;
      customContentBox.classList.toggle("hidden", contentType.value !== "custom");
    });
  
    masterToggle.addEventListener("change", () =>
      chrome.storage.local.set({ enabled: masterToggle.checked })
    );
    themeToggle.addEventListener("change", () =>
      chrome.storage.local.set({ darkMode: themeToggle.checked })
    );
    contentType.addEventListener("change", () => {
      chrome.storage.local.set({ contentType: contentType.value });
      customContentBox.classList.toggle("hidden", contentType.value !== "custom");
    });
    customContent.addEventListener("input", () =>
      chrome.storage.local.set({ customContent: customContent.value })
    );
    incognitoToggle.addEventListener("change", () =>
      chrome.storage.local.set({ incognitoAuto: incognitoToggle.checked })
    );
  
    class ReminderSystem {
      constructor() {
        this.reminders = [];
        this.loadReminders();
      }
  
      async loadReminders() {
        const data = await chrome.storage.local.get("reminders");
        this.reminders = data.reminders || [];
        this.displayReminders();
      }
  
      addReminder(reminder) {
        this.reminders.push(reminder);
        chrome.storage.local.set({ reminders: this.reminders });
        this.displayReminders();
      }
  
      deleteReminder(index) {
        this.reminders.splice(index, 1);
        chrome.storage.local.set({ reminders: this.reminders });
        this.displayReminders();
      }
  
      displayReminders() {
        const remindersList = document.getElementById("remindersList");
        remindersList.innerHTML = "";
  
        this.reminders.forEach((reminder, index) => {
          const reminderItem = document.createElement("div");
          reminderItem.className = "reminder-item";
          reminderItem.innerHTML = `
            <p><strong>${reminder.message}</strong> at ${new Date(
            reminder.time
          ).toLocaleTimeString()}</p>
            ${
              reminder.repeat
                ? `<p>Repeats every ${reminder.interval} minutes</p>`
                : ""
            }
            <button data-index="${index}" class="delete-reminder">❌</button>
          `;
          remindersList.appendChild(reminderItem);
        });
  
        document.querySelectorAll(".delete-reminder").forEach((button) => {
          button.addEventListener("click", (e) => {
            this.deleteReminder(e.target.dataset.index);
          });
        });
      }
    }
  
    const reminderSystem = new ReminderSystem();
  
    document.getElementById("addReminder").addEventListener("click", () => {
      const message = document.getElementById("reminderMessage").value;
      const timeInput = document.getElementById("reminderTime").value;
      const repeat = document.getElementById("reminderRepeat").checked;
      const interval = parseInt(
        document.getElementById("reminderInterval").value,
        10
      );
  
      if (!message.trim() || !timeInput) {
        alert("Please enter a message and a time.");
        return;
      }
  
      const time = new Date(timeInput).getTime();
  
      reminderSystem.addReminder({ message, time, repeat, interval });
      document.getElementById("reminderMessage").value = "";
      document.getElementById("reminderTime").value = "";
      document.getElementById("reminderRepeat").checked = false;
      document.getElementById("reminderInterval").value = "";
    });
  });