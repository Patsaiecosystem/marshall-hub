import { useState, useEffect } from "react";

const todayKey = () => new Date().toISOString().slice(0, 10);

const PLAN = [
  {
    id: "n1",
    night: 1,
    title: "Journal / Planner Agent",
    time: "~1–1.5 hrs",
    tasks: [
      { id: "n1t1", text: "Build daily log entry screen" },
      { id: "n1t2", text: "Add goal tracker with checkmarks" },
      { id: "n1t3", text: "Wire up persistent storage" },
      { id: "n1t4", text: "Auto-timestamp every log entry" },
    ],
  },
  {
    id: "n2",
    night: 2,
    title: "Health & Fitness Agent",
    time: "~1–1.5 hrs",
    tasks: [
      { id: "n2t1", text: "Log workouts & habits" },
      { id: "n2t2", text: "Track weight / measurements over time" },
      { id: "n2t3", text: "Build a streak tracker" },
      { id: "n2t4", text: "Connect to persistent storage" },
    ],
  },
  {
    id: "n3",
    night: 3,
    title: "Finance Agent",
    time: "~1.5–2 hrs",
    tasks: [
      { id: "n3t1", text: "Manual entry for accounts & investments" },
      { id: "n3t2", text: "Net worth over time chart" },
      { id: "n3t3", text: "Monthly snapshot view" },
    ],
  },
  {
    id: "n4",
    night: 4,
    title: "Brand / Social Agent",
    time: "~1.5–2 hrs",
    tasks: [
      { id: "n4t1", text: "Content calendar for TikTok & IG" },
      { id: "n4t2", text: "Caption / idea generator" },
      { id: "n4t3", text: "Posting checklist" },
    ],
  },
  {
    id: "n5",
    night: 5,
    title: "Wire Marshall's Dashboard",
    time: "~1–1.5 hrs",
    tasks: [
      { id: "n5t1", text: "Replace simulated pulses with real agent status" },
      { id: "n5t2", text: "One unified view of all four agents" },
    ],
  },
  {
    id: "n6",
    night: 6,
    title: "API Key + Hosting Setup",
    time: "~30–45 min",
    tasks: [
      { id: "n6t1", text: "Create Anthropic API account" },
      { id: "n6t2", text: "Create Vercel or Netlify account" },
    ],
  },
  {
    id: "n7",
    night: 7,
    title: "Deploy For Real",
    time: "~1.5–2 hrs",
    tasks: [
      { id: "n7t1", text: "Push everything live outside the sandbox" },
      { id: "n7t2", text: "Test every agent end-to-end" },
    ],
  },
];

const TABS = ["daily log", "health", "daily tasks", "history"];

const WEATHER_CODES = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

function TodayWidget() {
  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState("Locating...");
  const [temp, setTemp] = useState(null);
  const [conditions, setConditions] = useState("");
  const [tempUnit, setTempUnit] = useState("F");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const wRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit`
          );
          const wData = await wRes.json();
          if (wData.current_weather) {
            setTemp(Math.round(wData.current_weather.temperature));
            setConditions(WEATHER_CODES[wData.current_weather.weathercode] || "");
          }
        } catch (err) {}
        try {
          const gRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const gData = await gRes.json();
          const city =
            gData.address?.city || gData.address?.town || gData.address?.village || gData.address?.county;
          const state = gData.address?.state;
          setLocation(city && state ? `${city}, ${state}` : city || "Current location");
        } catch (err) {
          setLocation("Current location");
        }
      },
      () => setLocation("Location off")
    );
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0D1B2A 0%, #0A1420 100%)",
        border: "1px solid #1E2C3A",
        borderRadius: 16,
        padding: "20px 22px",
        marginBottom: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(95,232,213,0.14) 0%, transparent 70%)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ fontSize: 13, color: "#8FA0AE", marginBottom: 2 }}>
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#F2F6F8", letterSpacing: "-0.02em" }}>
            {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: 12, color: "#5FE8D5", marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>
            {location}
          </div>
        </div>
        {temp !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#F2F6F8" }}>{temp}°{tempUnit}</div>
            <div style={{ fontSize: 12, color: "#8FA0AE" }}>{conditions}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarshallHub() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState({});
  const [checked, setChecked] = useState({});
  const [dailyLog, setDailyLog] = useState({});
  const [health, setHealth] = useState({});
  const [healthDraft, setHealthDraft] = useState({ weight: "", note: "" });
  const [bodyStats, setBodyStats] = useState({ weight: "230", height: "6'3\"" });
  const [peptides, setPeptides] = useState([
    { name: "Retatrutide", amount: "12mg bottle" },
    { name: "BPC-157 / Ipamorelin stack", amount: "" },
    { name: "Tesamorelin", amount: "" },
  ]);
  const [foodLog, setFoodLog] = useState({});
  const [foodDraft, setFoodDraft] = useState({ item: "", calories: "" });
  const [draft, setDraft] = useState("");
  const [view, setView] = useState("daily log");
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    (async () => {
      let loadedEntries = {};
      try {
        const e = await window.storage.get("journal:entries");
        if (e) loadedEntries = JSON.parse(e.value);
      } catch (err) {}
      try {
        const r = await window.storage.get("roadmap:checked");
        if (r) setChecked(JSON.parse(r.value));
      } catch (err) {}
      try {
        const dl = await window.storage.get("roadmap:dailyLog");
        if (dl) setDailyLog(JSON.parse(dl.value));
      } catch (err) {}
      try {
        const h = await window.storage.get("health:logs");
        if (h) setHealth(JSON.parse(h.value));
      } catch (err) {}
      try {
        const bs = await window.storage.get("health:bodyStats");
        if (bs) setBodyStats(JSON.parse(bs.value));
      } catch (err) {}
      try {
        const pep = await window.storage.get("health:peptides");
        if (pep) setPeptides(JSON.parse(pep.value));
      } catch (err) {}
      try {
        const fl = await window.storage.get("health:foodLog");
        if (fl) setFoodLog(JSON.parse(fl.value));
      } catch (err) {}

      if (Object.keys(loadedEntries).length === 0) {
        const now = new Date();
        const stamp = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) +
          " at " + now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        const day1Text =
          "Day 1 — started building my own personal AI ecosystem while stoned.\n\n— Logged " + stamp;
        loadedEntries = { [todayKey()]: { day: 1, text: day1Text } };
        try {
          await window.storage.set("journal:entries", JSON.stringify(loadedEntries));
        } catch (err) {}
      }

      setEntries(loadedEntries);
      setLoading(false);
    })();
  }, []);

  const persistEntries = async (next) => {
    setEntries(next);
    setSaveState("saving");
    try {
      await window.storage.set("journal:entries", JSON.stringify(next));
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1200);
    } catch (err) {
      setSaveState("error");
    }
  };

  const toggleRoadmap = async (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try {
      await window.storage.set("roadmap:checked", JSON.stringify(next));
    } catch (err) {}

    if (next[id]) {
      const task = PLAN.flatMap((n) => n.tasks.map((t) => ({ ...t, night: n.night }))).find((t) => t.id === id);
      if (task) {
        const key = todayKey();
        const already = (dailyLog[key] || []).some((e) => e.id === id);
        if (!already) {
          const nextLog = {
            ...dailyLog,
            [key]: [...(dailyLog[key] || []), { id, text: task.text, night: task.night }],
          };
          setDailyLog(nextLog);
          try {
            await window.storage.set("roadmap:dailyLog", JSON.stringify(nextLog));
          } catch (err) {}
        }
      }
    }
  };

  const saveEntry = () => {
    if (!draft.trim()) return;
    const key = todayKey();
    const existing = entries[key];
    const dayNumber = existing ? existing.day : Object.keys(entries).length + 1;
    const now = new Date();
    const stamp = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) +
      " at " + now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const text = draft.trim() + "\n\n— Logged " + stamp;
    const next = { ...entries, [key]: { day: dayNumber, text } };
    persistEntries(next);
    setDraft("");
  };

  const saveHealth = async () => {
    if (!healthDraft.weight.trim() && !healthDraft.note.trim()) return;
    const key = todayKey();
    const next = {
      ...health,
      [key]: {
        weight: healthDraft.weight.trim() ? Number(healthDraft.weight.trim()) : null,
        note: healthDraft.note.trim(),
      },
    };
    setHealth(next);
    try {
      await window.storage.set("health:logs", JSON.stringify(next));
    } catch (err) {}
    if (healthDraft.weight.trim()) {
      const nextStats = { ...bodyStats, weight: healthDraft.weight.trim() };
      setBodyStats(nextStats);
      try {
        await window.storage.set("health:bodyStats", JSON.stringify(nextStats));
      } catch (err) {}
    }
    setHealthDraft({ weight: "", note: "" });
  };

  const healthDates = Object.keys(health).sort().reverse();

  const healthStreak = (() => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (health[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  const saveBodyStats = async (next) => {
    setBodyStats(next);
    try {
      await window.storage.set("health:bodyStats", JSON.stringify(next));
    } catch (err) {}
  };

  const savePeptides = async (next) => {
    setPeptides(next);
    try {
      await window.storage.set("health:peptides", JSON.stringify(next));
    } catch (err) {}
  };

  const updatePeptide = (idx, field, value) => {
    const next = peptides.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    savePeptides(next);
  };

  const addPeptide = () => {
    savePeptides([...peptides, { name: "", amount: "" }]);
  };

  const removePeptide = (idx) => {
    savePeptides(peptides.filter((_, i) => i !== idx));
  };

  const addFoodItem = async () => {
    if (!foodDraft.item.trim()) return;
    const key = todayKey();
    const entry = { item: foodDraft.item.trim(), calories: Number(foodDraft.calories) || 0 };
    const next = { ...foodLog, [key]: [...(foodLog[key] || []), entry] };
    setFoodLog(next);
    try {
      await window.storage.set("health:foodLog", JSON.stringify(next));
    } catch (err) {}
    setFoodDraft({ item: "", calories: "" });
  };

  const removeFoodItem = async (idx) => {
    const key = todayKey();
    const next = { ...foodLog, [key]: (foodLog[key] || []).filter((_, i) => i !== idx) };
    setFoodLog(next);
    try {
      await window.storage.set("health:foodLog", JSON.stringify(next));
    } catch (err) {}
  };

  const todayFood = foodLog[todayKey()] || [];
  const todayCalories = todayFood.reduce((sum, f) => sum + f.calories, 0);

  const entryDates = Object.keys(entries).sort().reverse();
  const historyDates = Array.from(new Set([...Object.keys(entries), ...Object.keys(dailyLog)])).sort().reverse();

  const totalTasks = PLAN.reduce((sum, n) => sum + n.tasks.length, 0);
  const doneTasks = PLAN.reduce(
    (sum, n) => sum + n.tasks.filter((t) => checked[t.id]).length,
    0
  );
  const pct = Math.round((doneTasks / totalTasks) * 100);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#05070B", display: "flex", alignItems: "center", justifyContent: "center", color: "#5FE8D5", fontFamily: "monospace" }}>
        Initializing...
      </div>
    );
  }

  const inputStyle = {
    width: "100%",
    background: "#05070B",
    border: "1px solid #182430",
    borderRadius: 8,
    color: "#E7EDF4",
    padding: 10,
    fontSize: 14,
  };

  const cardStyle = {
    background: "#0B131C",
    border: "1px solid #182430",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  };

  const labelStyle = {
    fontSize: 10,
    color: "#7C8CA0",
    letterSpacing: "0.12em",
    marginBottom: 10,
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  };

  const primaryBtn = {
    background: "#5FE8D5",
    color: "#05070B",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% -10%, #0D1B2A 0%, #05070B 55%, #030405 100%)",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        color: "#E7EDF4",
        padding: "24px 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        textarea, input { font-family: inherit; }
        textarea:focus, input:focus { outline: 1px solid #5FE8D5; }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px 1px rgba(95,232,213,0.35); }
          50% { box-shadow: 0 0 20px 3px rgba(95,232,213,0.6); }
        }
        .node-line {
          position: absolute;
          left: 17px;
          top: 40px;
          bottom: -18px;
          width: 1px;
          background: linear-gradient(180deg, #1E4A4A, #12202A);
        }
        .check-box {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 1px solid #2A5A5A;
          border-radius: 4px;
          background: #071012;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }
        .check-box:checked { background: #5FE8D5; border-color: #5FE8D5; }
        .check-box:checked::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid #05070B;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.25em", color: "#5FE8D5", marginBottom: 14 }}>
          MARSHALL // HUB
        </div>

        <TodayWidget />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {TABS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "#5FE8D5" : "#0B131C",
                color: view === v ? "#05070B" : "#7C8CA0",
                border: "1px solid " + (view === v ? "#5FE8D5" : "#182430"),
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {view === "daily log" && (
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: "#7C8CA0", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <textarea
              value={draft || (entries[todayKey()] && entries[todayKey()].text) || ""}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's going on today? Wins, tasks, how you're feeling..."
              rows={6}
              style={{ ...inputStyle, resize: "vertical", padding: 12 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "#7C8CA0" }}>
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : ""}
              </span>
              <button onClick={saveEntry} style={primaryBtn}>
                Save entry
              </button>
            </div>
          </div>
        )}

        {view === "health" && (
          <div>
            {/* Body stats */}
            <div style={labelStyle}>BODY STATS</div>
            <div style={cardStyle}>
              <div style={{ display: "flex", gap: 20, marginBottom: 4 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#7C8CA0", marginBottom: 4 }}>Weight</div>
                  <input
                    value={bodyStats.weight}
                    onChange={(e) => saveBodyStats({ ...bodyStats, weight: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#7C8CA0", marginBottom: 4 }}>Height</div>
                  <input
                    value={bodyStats.height}
                    onChange={(e) => saveBodyStats({ ...bodyStats, height: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <div style={{ flex: 1, background: "#05070B", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#5FE8D5" }}>{healthStreak}</div>
                  <div style={{ fontSize: 10, color: "#7C8CA0", letterSpacing: "0.08em" }}>DAY STREAK</div>
                </div>
                <div style={{ flex: 1, background: "#05070B", borderRadius: 10, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#5FE8D5" }}>{todayCalories || "—"}</div>
                  <div style={{ fontSize: 10, color: "#7C8CA0", letterSpacing: "0.08em" }}>CAL TODAY</div>
                </div>
              </div>
            </div>

            {/* Daily check-in */}
            <div style={labelStyle}>DAILY CHECK-IN</div>
            <div style={cardStyle}>
              <textarea
                value={healthDraft.note}
                onChange={(e) => setHealthDraft({ ...healthDraft, note: e.target.value })}
                placeholder="Workout, habits, how the body feels..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <input
                  type="number"
                  value={healthDraft.weight}
                  onChange={(e) => setHealthDraft({ ...healthDraft, weight: e.target.value })}
                  placeholder="Weight"
                  style={{ ...inputStyle, width: 100 }}
                />
                <button onClick={saveHealth} style={primaryBtn}>
                  Log
                </button>
              </div>
            </div>

            {/* Peptide inventory */}
            <div style={labelStyle}>PEPTIDE INVENTORY</div>
            <div style={cardStyle}>
              {peptides.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input
                    value={p.name}
                    onChange={(e) => updatePeptide(i, "name", e.target.value)}
                    placeholder="Name"
                    style={{ ...inputStyle, flex: 2 }}
                  />
                  <input
                    value={p.amount}
                    onChange={(e) => updatePeptide(i, "amount", e.target.value)}
                    placeholder="Amount"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={() => removePeptide(i)}
                    style={{ background: "none", border: "none", color: "#4A5A68", cursor: "pointer", fontSize: 18 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addPeptide}
                style={{ ...primaryBtn, background: "#182430", color: "#8FE0D3", marginTop: 4 }}
              >
                + Add
              </button>
            </div>

            {/* Food log */}
            <div style={labelStyle}>FOOD LOG — TODAY</div>
            <div style={cardStyle}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  value={foodDraft.item}
                  onChange={(e) => setFoodDraft({ ...foodDraft, item: e.target.value })}
                  placeholder="Food item"
                  style={{ ...inputStyle, flex: 2 }}
                />
                <input
                  type="number"
                  value={foodDraft.calories}
                  onChange={(e) => setFoodDraft({ ...foodDraft, calories: e.target.value })}
                  placeholder="Cal"
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
              <button
                onClick={addFoodItem}
                style={{ ...primaryBtn, marginBottom: todayFood.length ? 10 : 0 }}
              >
                Add item
              </button>
              {todayFood.map((f, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: "1px solid #182430" }}>
                  <span style={{ fontSize: 13, color: "#C7D2DC" }}>{f.item}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "#7C8CA0", fontFamily: "'JetBrains Mono', monospace" }}>{f.calories} cal</span>
                    <button
                      onClick={() => removeFoodItem(i)}
                      style={{ background: "none", border: "none", color: "#4A5A68", cursor: "pointer", fontSize: 15 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "daily tasks" && (
          <div>
            <p style={{ fontSize: 13, color: "#7C8CA0", margin: "0 0 20px" }}>
              7 nights to a fully live AI ecosystem.
            </p>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#7C8CA0", marginBottom: 6 }}>
                <span>PROGRESS</span>
                <span style={{ color: "#5FE8D5" }}>{doneTasks}/{totalTasks} · {pct}%</span>
              </div>
              <div style={{ height: 6, background: "#0D1620", borderRadius: 3, overflow: "hidden", border: "1px solid #1A2833" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #1E9E8C, #5FE8D5)",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {PLAN.map((night, idx) => {
              const nightDone = night.tasks.every((t) => checked[t.id]);
              const nightStarted = night.tasks.some((t) => checked[t.id]);
              return (
                <div key={night.id} style={{ position: "relative", paddingLeft: 40, marginBottom: idx === PLAN.length - 1 ? 0 : 6 }}>
                  {idx !== PLAN.length - 1 && <div className="node-line" />}
                  <div
                    style={{
                      position: "absolute",
                      left: 8,
                      top: 4,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: nightDone ? "#5FE8D5" : "#0D1620",
                      border: `1px solid ${nightDone ? "#5FE8D5" : nightStarted ? "#E8A33D" : "#2A3A45"}`,
                      animation: nightDone ? "glowPulse 2.2s ease-in-out infinite" : "none",
                    }}
                  />
                  <div
                    style={{
                      background: "linear-gradient(180deg, #0B131C 0%, #080E15 100%)",
                      border: `1px solid ${nightDone ? "#2A5A5A" : "#182430"}`,
                      borderLeft: `2px solid ${nightDone ? "#5FE8D5" : nightStarted ? "#E8A33D" : "#2A3A45"}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: nightDone ? "#5FE8D5" : "#7C8CA0", letterSpacing: "0.1em" }}>
                        NIGHT {night.night}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#4A5A68" }}>
                        {night.time}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10 }}>{night.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {night.tasks.map((t) => (
                        <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            className="check-box"
                            checked={!!checked[t.id]}
                            onChange={() => toggleRoadmap(t.id)}
                          />
                          <span
                            style={{
                              fontSize: 13.5,
                              color: checked[t.id] ? "#4A5A68" : "#C7D2DC",
                              textDecoration: checked[t.id] ? "line-through" : "none",
                            }}
                          >
                            {t.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "history" && (
          <div>
            {historyDates.length === 0 && (
              <div style={{ fontSize: 13, color: "#4A5A68", textAlign: "center", marginTop: 20 }}>
                No history yet — write a log or check off a task today.
              </div>
            )}
            {historyDates.map((d) => {
              const entry = entries[d];
              const tasksDone = dailyLog[d] || [];
              return (
                <div key={d} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#5FE8D5", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                    {entry ? `Day ${entry.day} · ` : ""}
                    {new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  {entry && (
                    <div style={{ fontSize: 13, color: "#C7D2DC", whiteSpace: "pre-wrap", marginBottom: tasksDone.length ? 10 : 0 }}>
                      {entry.text}
                    </div>
                  )}
                  {tasksDone.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#7C8CA0", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                        TASKS COMPLETED
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {tasksDone.map((t) => (
                          <div key={t.id} style={{ fontSize: 12.5, color: "#8FE0D3", display: "flex", gap: 6 }}>
                            <span>✓</span>
                            <span>{t.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
