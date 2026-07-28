let sb;
try {
  sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error("Supabase-Client konnte nicht erstellt werden:", err);
}

const PASSCODE_STORAGE_KEY = "logbuch_passcode";

function getStoredPasscode() {
  return localStorage.getItem(PASSCODE_STORAGE_KEY) || "";
}

function storePasscode(code) {
  localStorage.setItem(PASSCODE_STORAGE_KEY, code);
}

async function tryUnlock(code, showErrorOnFail) {
  if (!sb) {
    if (showErrorOnFail) {
      document.getElementById("gate-error").hidden = false;
      document.getElementById("gate-error").textContent =
        "Verbindung fehlgeschlagen. Bitte Seite neu laden.";
    }
    return false;
  }

  try {
    const { data, error } = await sb.rpc("verify_login", { passcode: code });

    if (error || data !== true) {
      if (showErrorOnFail) {
        document.getElementById("gate-error").hidden = false;
        document.getElementById("gate-error").textContent = "Falsches Kennwort.";
      }
      return false;
    }

    storePasscode(code);
    document.getElementById("gate").hidden = true;
    document.getElementById("app").hidden = false;
    initApp();
    return true;
  } catch (err) {
    console.error("Login fehlgeschlagen:", err);
    if (showErrorOnFail) {
      document.getElementById("gate-error").hidden = false;
      document.getElementById("gate-error").textContent =
        "Verbindung fehlgeschlagen. Bitte Seite neu laden.";
    }
    return false;
  }
}

document.getElementById("gate-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const val = document.getElementById("gate-input").value;
  const button = e.target.querySelector("button");
  button.disabled = true;
  await tryUnlock(val, true);
  button.disabled = false;
});

(async function autoUnlock() {
  const saved = getStoredPasscode();
  if (saved) {
    const ok = await tryUnlock(saved, false);
    if (!ok) {
      localStorage.removeItem(PASSCODE_STORAGE_KEY);
    }
  }
})();

let appInitialized = false;
function initApp() {
  if (appInitialized) return;
  appInitialized = true;
  try { startTimer(); } catch (err) { console.error("Timer-Fehler:", err); }
  initDailyMessage().catch(err => console.error("Nachricht-Fehler:", err));
  try { initMap(); } catch (err) { console.error("Karten-Fehler:", err); }
  initTodos().catch(err => console.error("Todo-Fehler:", err));
}

function currentPasscode() {
  return getStoredPasscode();
}

function startTimer() {
  function update() {
    const now = new Date();
    let diffMs = now - START_DATE;
    if (diffMs < 0) diffMs = 0;

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    let years = now.getFullYear() - START_DATE.getFullYear();
    let months = now.getMonth() - START_DATE.getMonth();
    let days = now.getDate() - START_DATE.getDate();
    let hours = now.getHours() - START_DATE.getHours();
    let minutes = now.getMinutes() - START_DATE.getMinutes();
    let seconds = now.getSeconds() - START_DATE.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }

    setText("t-years", years);
    setText("t-months", months);
    setText("t-days", days);
    setText("t-hours", String(hours).padStart(2, "0"));
    setText("t-minutes", String(minutes).padStart(2, "0"));
    setText("t-seconds", String(seconds).padStart(2, "0"));

    setText("t-totaldays", totalDays.toLocaleString("de-DE"));
    setText("t-totalhours", totalHours.toLocaleString("de-DE"));
    setText("t-totalminutes", totalMinutes.toLocaleString("de-DE"));
  }
  function safeUpdate() {
    try {
      update();
    } catch (err) {
      console.error("Timer-Update-Fehler:", err);
    }
  }
  safeUpdate();
  setInterval(safeUpdate, 1000);
}

async function initDailyMessage() {
  await loadDailyMessage();

  document.getElementById("message-save").addEventListener("click", async () => {
    const text = document.getElementById("message-input").value.trim();
    const statusEl = document.getElementById("message-status");
    if (!text) return;

    statusEl.textContent = "Speichere …";
    const { error } = await sb.rpc("set_daily_message", {
      passcode: currentPasscode(),
      p_text: text
    });

    if (error) {
      statusEl.textContent = "Fehler beim Speichern.";
      console.error(error);
    } else {
      statusEl.textContent = "Gespeichert ✓";
      document.getElementById("message-input").value = "";
      await loadDailyMessage();
      setTimeout(() => { statusEl.textContent = ""; }, 2500);
    }
  });
}

async function loadDailyMessage() {
  const { data, error } = await sb.rpc("get_daily_message", { passcode: currentPasscode() });

  const msgEl = document.getElementById("daily-message");
  const dateEl = document.getElementById("daily-message-date");

  if (error) {
    msgEl.textContent = "Nachricht konnte nicht geladen werden.";
    console.error(error);
    return;
  }

  if (data && data.text) {
    msgEl.textContent = "„" + data.text + "“";
    const d = new Date(data.updated_at);
    dateEl.textContent = "zuletzt aktualisiert am " + d.toLocaleDateString("de-DE", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } else {
    msgEl.textContent = "Noch keine Nachricht hinterlassen.";
    dateEl.textContent = "";
  }
}

let map;

function initMap() {
  map = L.map("map").setView([48.1351, 11.5820], 4);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19
  }).addTo(map);

  map.on("click", async (e) => {
    const { error } = await sb.rpc("add_pin", {
      passcode: currentPasscode(),
      p_lat: e.latlng.lat,
      p_lng: e.latlng.lng,
      p_label: "",
      p_type: "been"
    });

    if (error) {
      alert("Pin konnte nicht gespeichert werden.");
      console.error(error);
    } else {
      await loadPins();
    }
  });

  loadPins();
}

let pinMarkers = [];

async function loadPins() {
  const { data, error } = await sb.rpc("get_pins", { passcode: currentPasscode() });

  if (error) {
    console.error(error);
    return;
  }

  pinMarkers.forEach(m => map.removeLayer(m));
  pinMarkers = [];

  const listEl = document.getElementById("pin-list");
  listEl.innerHTML = "";

  data.forEach(pin => {
    const marker = L.circleMarker([pin.lat, pin.lng], {
      radius: 8,
      fillColor: "#c1502e",
      color: "#fff",
      weight: 2,
      fillOpacity: 0.9
    }).addTo(map);
    pinMarkers.push(marker);

    const li = document.createElement("li");
    li.innerHTML = "<span>Pin</span>";
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.title = "Pin löschen";
    delBtn.addEventListener("click", async () => {
      await sb.rpc("delete_pin", { passcode: currentPasscode(), p_id: pin.id });
      await loadPins();
    });
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

async function initTodos() {
  document.getElementById("todo-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("todo-input");
    const text = input.value.trim();
    if (!text) return;

    const { error } = await sb.rpc("add_todo", { passcode: currentPasscode(), p_text: text });
    if (error) {
      alert("Konnte nicht hinzugefügt werden.");
      console.error(error);
    } else {
      input.value = "";
      await loadTodos();
    }
  });

  await loadTodos();
}

async function loadTodos() {
  const { data, error } = await sb.rpc("get_todos", { passcode: currentPasscode() });

  if (error) {
    console.error(error);
    return;
  }

  const listEl = document.getElementById("todo-list");
  listEl.innerHTML = "";

  data.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", async () => {
      await sb.rpc("set_todo_done", { passcode: currentPasscode(), p_id: todo.id, p_done: checkbox.checked });
      await loadTodos();
    });

    const span = document.createElement("span");
    span.textContent = todo.text;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "✕";
    delBtn.title = "Löschen";
    delBtn.addEventListener("click", async () => {
      await sb.rpc("delete_todo", { passcode: currentPasscode(), p_id: todo.id });
      await loadTodos();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
