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

const TABS = ["today", "daily tasks", "history"];

export default function MarshallHub() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState({});
  const [checked, setChecked] = useState({});
  const [dailyLog, setDailyLog] = useState({});
  const [draft, setDraft] = useState("");
  const [view, setView] = useState("today");
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
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.25em", color: "#5FE8D5", marginBottom: 4 }}>
          MARSHALL // HUB
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 18px" }}>
          {view === "daily tasks" ? "Ecosystem Rollout" : "Daily Log"}
        </h1>

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
                borderRadius: 6,
                padding: "6px 14px",
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

        {view === "today" && (
          <div style={{ background: "#0B131C", border: "1px solid #182430", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#7C8CA0", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <textarea
              value={draft || (entries[todayKey()] && entries[todayKey()].text) || ""}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's going on today? Wins, tasks, how you're feeling..."
              rows={6}
              style={{
                width: "100%",
                background: "#05070B",
                border: "1px solid #182430",
                borderRadius: 8,
                color: "#E7EDF4",
                padding: 12,
                fontSize: 14,
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <span style={{ fontSize: 11, color: "#7C8CA0" }}>
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : ""}
              </span>
              <button
                onClick={saveEntry}
                style={{
                  background: "#5FE8D5",
                  color: "#05070B",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Save entry
              </button>
            </div>
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
                <div key={d} style={{ background: "#0B131C", border: "1px solid #182430", borderRadius: 8, padding: 14, marginBottom: 10 }}>
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
                      borderRadius: 8,
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
      </div>
    </div>
  );
}
