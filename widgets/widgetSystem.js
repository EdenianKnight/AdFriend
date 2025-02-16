class WidgetSystem {
    constructor() {
      this.widgetTypes = {
        clock: this.createClock,
        todo: this.createTodo,
        notes: this.createNotes,
        timer: this.createTimer,
      };
    }
  
    async createWidget(type, container) {
      if (this.widgetTypes[type]) {
        return this.widgetTypes[type](container);
      }
    }
  
    createClock(container) {
      const clock = document.createElement("div");
      clock.className = "widget clock";
      clock.innerHTML = `
          <div class="time">00:00:00</div>
          <div class="date"></div>
        `;
  
      setInterval(() => {
        const now = new Date();
        clock.querySelector(".time").textContent = now.toLocaleTimeString();
        clock.querySelector(".date").textContent = now.toLocaleDateString();
      }, 1000);
  
      container.appendChild(clock);
    }
  
    createTodo(container) {
      const todo = document.createElement("div");
      todo.className = "widget todo";
      todo.innerHTML = `
          <input type="text" placeholder="Add task...">
          <ul class="todo-list"></ul>
        `;
  
      todo.querySelector("input").addEventListener("keyup", (e) => {
        if (e.key === "Enter" && e.target.value) {
          const li = document.createElement("li");
          li.textContent = e.target.value;
          todo.querySelector(".todo-list").appendChild(li);
          e.target.value = "";
        }
      });
  
      container.appendChild(todo);
    }
  
    createNotes(container) {
      const notes = document.createElement("div");
      notes.className = "widget notes";
      notes.innerHTML = `
          <textarea placeholder="Quick notes..."></textarea>
        `;
  
      notes.querySelector("textarea").addEventListener("input", (e) => {
        chrome.storage.local.set({ notes: e.target.value });
      });
  
      container.appendChild(notes);
    }
  
    createTimer(container) {
      const timer = document.createElement("div");
      timer.className = "widget timer";
      timer.innerHTML = `
          <input type="number" min="1" max="60" value="5">
          <button>Start</button>
          <div class="countdown"></div>
        `;
  
      let interval;
      timer.querySelector("button").addEventListener("click", (e) => {
        const minutes = timer.querySelector("input").value;
        let seconds = minutes * 60;
  
        clearInterval(interval);
        interval = setInterval(() => {
          seconds--;
          timer.querySelector(".countdown").textContent = `${Math.floor(
            seconds / 60
          )}:${(seconds % 60).toString().padStart(2, "0")}`;
  
          if (seconds <= 0) {
            clearInterval(interval);
            new Notification("Timer Complete!");
          }
        }, 1000);
      });
  
      container.appendChild(timer);
    }
  }