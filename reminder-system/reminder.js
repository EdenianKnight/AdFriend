class ReminderSystem {
    constructor() {
      this.initializeAlarms();
      this.setupListeners();
    }
  
    async initializeAlarms() {
      const { reminders = [] } = await chrome.storage.local.get("reminders");
      reminders.forEach((reminder) => this.createAlarm(reminder));
    }
  
    createAlarm(reminder) {
      chrome.alarms.create(reminder.id, {
        when: reminder.time,
        periodInMinutes: reminder.repeat ? reminder.interval : undefined,
      });
    }
  
    setupListeners() {
      chrome.alarms.onAlarm.addListener(this.handleAlarm.bind(this));
    }
  
    async handleAlarm(alarm) {
      const { reminders = [] } = await chrome.storage.local.get("reminders");
      const reminder = reminders.find((r) => r.id === alarm.name);
  
      if (reminder) {
        chrome.notifications.create(reminder.id, {
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "AdFriend Reminder",
          message: reminder.message,
        });
      }
    }
  
    async addReminder(reminder) {
      const { reminders = [] } = await chrome.storage.local.get("reminders");
      reminder.id = Date.now().toString();
      reminders.push(reminder);
      await chrome.storage.local.set({ reminders });
      this.createAlarm(reminder);
    }
  
    async removeReminder(id) {
      const { reminders = [] } = await chrome.storage.local.get("reminders");
      const updatedReminders = reminders.filter((r) => r.id !== id);
      await chrome.storage.local.set({ reminders: updatedReminders });
      await chrome.alarms.clear(id);
    }
  }