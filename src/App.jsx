import { useState, useEffect } from "react";
import hologramImg from "../7.6.18-FOM.jpg";

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

const TABS = ["daily log", "daily tasks", "health", "history"];

const WORKOUT_PLAN = [
  {
    day: 1,
    title: "Push",
    exercises: [
      "Barbell bench press 4x6-8",
      "Incline DB press 3x8-10",
      "Weighted dips 3x8-10",
      "Seated DB shoulder press 3x8-10",
      "Cable lateral raise 3x12-15",
      "Overhead triceps extension 3x10-12",
    ],
  },
  {
    day: 2,
    title: "Pull",
    exercises: [
      "Deadlift 4x5",
      "Weighted pull-ups 4x6-8",
      "Barbell row 3x8-10",
      "Seated cable row 3x10-12",
      "Face pulls 3x15",
      "Barbell curl 3x8-10",
    ],
  },
  {
    day: 3,
    title: "Legs",
    exercises: [
      "Back squat 4x6-8",
      "Romanian deadlift 3x8-10",
      "Leg press 3x10-12",
      "Walking lunges 3x12/leg",
      "Leg curl 3x10-12",
      "Standing calf raise 4x12-15",
    ],
  },
  {
    day: 4,
    title: "Push (volume variation)",
    exercises: [
      "Incline barbell press 4x8-10",
      "DB shoulder press 3x8-10",
      "Cable fly 3x12-15",
      "Lateral raise 4x15",
      "Close-grip bench 3x8-10",
      "Rope pushdown 3x12-15",
    ],
  },
  {
    day: 5,
    title: "Pull (volume variation)",
    exercises: [
      "Rack pulls or deadlift variation 3x5-6",
      "Lat pulldown 4x8-10",
      "Chest-supported row 3x10-12",
      "Rear delt fly 3x15",
      "Hammer curl 3x10-12",
      "Preacher curl 3x10-12",
    ],
  },
  {
    day: 6,
    title: "Legs (volume variation)",
    exercises: [
      "Front squat 4x6-8",
      "Hip thrust 3x8-10",
      "Bulgarian split squat 3x10/leg",
      "Leg extension 3x12-15",
      "Seated calf raise 4x15",
      "Ab work (hanging leg raises, cable crunch) 3 sets",
    ],
  },
  {
    day: 7,
    title: "Rest",
    exercises: ["Walking is fine"],
  },
];

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
  const [forecastNote, setForecastNote] = useState("");
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
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=weathercode&temperature_unit=fahrenheit&forecast_days=1&timezone=auto`
          );
          const wData = await wRes.json();
          if (wData.current_weather) {
            setTemp(Math.round(wData.current_weather.temperature));
            setConditions(WEATHER_CODES[wData.current_weather.weathercode] || "");
          }
          if (wData.hourly && wData.hourly.weathercode) {
            const currentHour = new Date().getHours();
            const upcoming = wData.hourly.weathercode.slice(currentHour + 1);
            const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
            const snowCodes = [71, 73, 75];
            if (upcoming.some((c) => rainCodes.includes(c))) {
              setForecastNote("Rain expected later today");
            } else if (upcoming.some((c) => snowCodes.includes(c))) {
              setForecastNote("Snow expected later today");
            } else {
              setForecastNote("No change expected");
            }
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
        background: "linear-gradient(155deg, #0D0D0D 0%, #000000 100%)",
        border: "1px solid #2E2A1C",
        borderRadius: 18,
        padding: "22px 24px",
        marginBottom: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4) 50%, transparent)",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ fontSize: 13, color: "#9A9AA2", marginBottom: 2, letterSpacing: "0.02em" }}>
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#F5F3EC", letterSpacing: "-0.02em" }}>
            {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </div>
          <div style={{ fontSize: 12, color: "#D4AF37", marginTop: 7, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em" }}>
            {location}
          </div>
        </div>
        {temp !== null && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#F5F3EC" }}>{temp}°{tempUnit}</div>
            <div style={{ fontSize: 12.5, color: "#C6C6CC", marginTop: 2 }}>{conditions}</div>
            {forecastNote && (
              <div style={{ fontSize: 10.5, color: "#7A7A80", marginTop: 4, letterSpacing: "0.02em" }}>
                {forecastNote}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HologramBody() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "16px 0 8px",
        perspective: 900,
      }}
    >
      <style>{`
        @keyframes hologramFlicker {
          0%, 100% { opacity: 1; }
          48% { opacity: 0.94; }
          50% { opacity: 0.78; }
          52% { opacity: 0.97; }
        }
        @keyframes hologramSpin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        .hologram-figure {
          animation: hologramFlicker 4.5s ease-in-out infinite, hologramSpin 7s linear infinite;
          transform-style: preserve-3d;
        }
      `}</style>
      <img
        className="hologram-figure"
        src={hologramImg}
        alt="Hologram"
        style={{
          width: 200,
          height: "auto",
          filter:
            "brightness(1.3) contrast(1.4) saturate(1.6) drop-shadow(0 0 10px rgba(95,212,245,0.85)) drop-shadow(0 0 24px rgba(95,212,245,0.5))",
        }}
      />
    </div>
  );
}


function Lobby({ onEnter }) {
  const buildings = [
    { x: 0, w: 30, h: 90 }, { x: 32, w: 22, h: 140 }, { x: 56, w: 28, h: 110 },
    { x: 86, w: 20, h: 170 }, { x: 108, w: 34, h: 130 }, { x: 144, w: 24, h: 200 },
    { x: 170, w: 30, h: 150 }, { x: 202, w: 22, h: 115 }, { x: 226, w: 32, h: 175 },
    { x: 260, w: 24, h: 135 }, { x: 286, w: 28, h: 95 }, { x: 316, w: 20, h: 160 },
    { x: 338, w: 26, h: 120 },
  ];
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, #16130C 0%, #0A0806 45%, #050403 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "44px 20px 40px",
        boxSizing: "border-box",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Cormorant+Garamond:wght@500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes windowTwinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes chandelierGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
      `}</style>

      {/* chandelier glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 200,
          background: "radial-gradient(ellipse, rgba(212,175,55,0.22) 0%, transparent 70%)",
          animation: "chandelierGlow 4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.3em", color: "#8A8478" }}>
          THE
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 46, fontWeight: 600, color: "#F5F3EC", letterSpacing: "0.04em", marginTop: 2 }}>
          MARSHALL
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.35em", color: "#D4AF37", marginTop: 4 }}>
          PRIVATE OFFICE
        </div>
      </div>

      {/* Window with skyline view, glass mullions, warm wood frame */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          height: 220,
          marginTop: 34,
          padding: 10,
          background: "linear-gradient(180deg, #241C10 0%, #14100A 100%)",
          border: "1px solid #4A3F26",
          borderRadius: 6,
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: 2, background: "linear-gradient(180deg, #0C1826 0%, #060504 100%)" }}>
          <svg width="100%" height="100%" viewBox="0 0 362 200" preserveAspectRatio="xMidYMax slice">
            {buildings.map((b, i) => (
              <g key={i}>
                <rect x={b.x} y={200 - b.h} width={b.w} height={b.h} fill="#101012" stroke="#221E14" strokeWidth="0.5" />
                {Array.from({ length: Math.floor(b.h / 16) }).map((_, r) =>
                  Array.from({ length: Math.max(1, Math.floor(b.w / 9)) }).map((_, c) => {
                    const lit = (i * 7 + r * 3 + c) % 4 === 0;
                    return lit ? (
                      <rect
                        key={r + "-" + c}
                        x={b.x + 3 + c * 8}
                        y={200 - b.h + 6 + r * 16}
                        width={3.5}
                        height={5}
                        fill="#D4AF37"
                        style={{ animation: `windowTwinkle ${3 + ((r + c) % 4)}s ease-in-out infinite`, animationDelay: `${(r + c) * 0.2}s` }}
                      />
                    ) : null;
                  })
                )}
              </g>
            ))}
          </svg>
          {/* window mullions */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "33%", width: 3, background: "#14100A" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "66%", width: 3, background: "#14100A" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, background: "#14100A" }} />
        </div>
      </div>

      {/* Marble floor with reception desk */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          marginTop: 0,
          paddingTop: 40,
        }}
      >
        {/* marble floor */}
        <div
          style={{
            position: "absolute",
            bottom: -20,
            left: "-10%",
            right: "-10%",
            height: 90,
            background: "linear-gradient(180deg, #1C1912 0%, #0A0806 100%)",
            transform: "perspective(300px) rotateX(55deg)",
            transformOrigin: "top",
            opacity: 0.6,
          }}
        />

        {/* angled marble reception desk */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            height: 64,
            background: "linear-gradient(115deg, #2A2620 0%, #16140F 55%, #0A0906 100%)",
            border: "1px solid #4A4028",
            borderTop: "2px solid #D4AF37",
            clipPath: "polygon(0 100%, 3% 0, 97% 0, 100% 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(212,175,55,0.08)",
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.25em", color: "#B8AE94" }}>
            RECEPTION
          </span>
        </div>
      </div>

      <button
        onClick={onEnter}
        style={{
          marginTop: 34,
          position: "relative",
          zIndex: 2,
          background: "linear-gradient(180deg, #E8C468 0%, #D4AF37 100%)",
          color: "#0A0806",
          border: "none",
          borderRadius: 8,
          padding: "13px 36px",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.04em",
          cursor: "pointer",
          boxShadow: "0 4px 18px rgba(212,175,55,0.25)",
        }}
      >
        Enter Office
      </button>
    </div>
  );
}


export default function MarshallHub() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState({});
  const [checked, setChecked] = useState({});
  const [dailyLog, setDailyLog] = useState({});
  const [health, setHealth] = useState({});
  const [bodyStats, setBodyStats] = useState({
    name: "Patrick Mingione",
    weight: "230",
    height: "6'3\"",
    eyeColor: "Blue",
    hairColor: "Brown",
  });
  const [peptideNames, setPeptideNames] = useState([
    "Retatrutide",
    "BPC-157 / Ipamorelin stack",
    "Tesamorelin",
  ]);
  const [newPeptideName, setNewPeptideName] = useState("");
  const [dosageForm, setDosageForm] = useState({});
  const [foodForm, setFoodForm] = useState([{ item: "", calories: "", protein: "", carbs: "", fat: "" }]);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(3);
  const [exerciseChecks, setExerciseChecks] = useState({});
  const [draft, setDraft] = useState("");
  const [view, setView] = useState("daily log");
  const [entered, setEntered] = useState(false);
  const [saveState, setSaveState] = useState("idle");

  useEffect(() => {
    (async () => {
      let loadedEntries = {};
      try {
        const e = await window.storage.get("journal:entries");
        if (e) loadedEntries = JSON.parse(e.value);
      } catch (err) {}

      // migrate old { day, text } entries to new { day, items: [...] } shape
      let migrated = false;
      Object.keys(loadedEntries).forEach((k) => {
        const v = loadedEntries[k];
        if (v && typeof v.text === "string" && !v.items) {
          loadedEntries[k] = { day: v.day, items: [{ text: v.text, time: "" }] };
          migrated = true;
        }
      });
      if (migrated) {
        try {
          await window.storage.set("journal:entries", JSON.stringify(loadedEntries));
        } catch (err) {}
      }
      try {
        const r = await window.storage.get("roadmap:checked");
        if (r) setChecked(JSON.parse(r.value));
      } catch (err) {}
      try {
        const dl = await window.storage.get("roadmap:dailyLog");
        if (dl) setDailyLog(JSON.parse(dl.value));
      } catch (err) {}
      try {
        const h = await window.storage.get("health:formHistory");
        if (h) setHealth(JSON.parse(h.value));
      } catch (err) {}
      try {
        const bs = await window.storage.get("health:bodyStats");
        if (bs) setBodyStats(JSON.parse(bs.value));
      } catch (err) {}
      try {
        const pep = await window.storage.get("health:peptideNames");
        if (pep) setPeptideNames(JSON.parse(pep.value));
      } catch (err) {}

      if (Object.keys(loadedEntries).length === 0) {
        const now = new Date();
        const stamp = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) +
          " at " + now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
        const day1Text =
          "Day 1 — started building my own personal AI ecosystem while stoned.\n\n— Logged " + stamp;
        loadedEntries = { [todayKey()]: { day: 1, items: [{ text: day1Text, time: stamp }] } };
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
    const newItem = { text: draft.trim(), time: stamp };
    const items = existing ? [...existing.items, newItem] : [newItem];
    const next = { ...entries, [key]: { day: dayNumber, items } };
    persistEntries(next);
    setDraft("");
  };

  const saveBodyStats = async (next) => {
    setBodyStats(next);
    try {
      await window.storage.set("health:bodyStats", JSON.stringify(next));
    } catch (err) {}
  };

  const savePeptideNames = async (next) => {
    setPeptideNames(next);
    try {
      await window.storage.set("health:peptideNames", JSON.stringify(next));
    } catch (err) {}
  };

  const addPeptideName = () => {
    if (!newPeptideName.trim()) return;
    savePeptideNames([...peptideNames, newPeptideName.trim()]);
    setNewPeptideName("");
  };

  const removePeptideName = (idx) => {
    savePeptideNames(peptideNames.filter((_, i) => i !== idx));
  };

  const updateFoodRow = (idx, field, value) => {
    setFoodForm(foodForm.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  const addFoodRow = () => {
    setFoodForm([...foodForm, { item: "", calories: "", protein: "", carbs: "", fat: "" }]);
  };

  const removeFoodRow = (idx) => {
    setFoodForm(foodForm.filter((_, i) => i !== idx));
  };

  const toggleExercise = (id) => {
    setExerciseChecks({ ...exerciseChecks, [id]: !exerciseChecks[id] });
  };

  const healthDates = Object.keys(health).sort().reverse();

  const saveHealthForm = async () => {
    const key = todayKey();
    const now = new Date();
    const stamp = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const workoutDayData = WORKOUT_PLAN.find((d) => d.day === selectedWorkoutDay);
    const exercisesDone = workoutDayData
      ? workoutDayData.exercises.filter((_, i) => exerciseChecks[`${selectedWorkoutDay}-${i}`])
      : [];
    const snapshot = {
      time: stamp,
      name: bodyStats.name,
      weight: bodyStats.weight,
      height: bodyStats.height,
      dosages: Object.entries(dosageForm)
        .filter(([, v]) => v && v.trim())
        .map(([name, dosage]) => ({ name, dosage })),
      food: foodForm.filter((f) => f.item.trim()),
      workoutDay: selectedWorkoutDay,
      workoutTitle: workoutDayData ? workoutDayData.title : "",
      exercisesDone,
    };
    const next = { ...health, [key]: [...(health[key] || []), snapshot] };
    setHealth(next);
    try {
      await window.storage.set("health:formHistory", JSON.stringify(next));
    } catch (err) {}
  };

  const newHealthForm = () => {
    setDosageForm({});
    setFoodForm([{ item: "", calories: "", protein: "", carbs: "", fat: "" }]);
    setExerciseChecks({});
  };

  const todayCalories = foodForm.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);

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
      <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#D4AF37", fontFamily: "monospace" }}>
        Initializing...
      </div>
    );
  }

  if (!entered) {
    return <Lobby onEnter={() => setEntered(true)} />;
  }

  const inputStyle = {
    width: "100%",
    background: "#0A0A0A",
    border: "1px solid #2A2A2E",
    borderRadius: 8,
    color: "#F5F3EC",
    padding: 10,
    fontSize: 14,
  };

  const cardStyle = {
    background: "#111113",
    border: "1px solid #2A2A2E",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  };

  const labelStyle = {
    fontSize: 10,
    color: "#9A9AA2",
    letterSpacing: "0.12em",
    marginBottom: 10,
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase",
  };

  const primaryBtn = {
    background: "#D4AF37",
    color: "#0A0A0A",
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
        background: "radial-gradient(ellipse at 50% -10%, #0A0A0A 0%, #0A0A0A 55%, #000000 100%)",
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        color: "#F5F3EC",
        padding: "24px 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        textarea, input { font-family: inherit; }
        textarea:focus, input:focus { outline: 1px solid #D4AF37; }
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
          background: linear-gradient(180deg, #3A3320, #1A1710);
        }
        .check-box {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border: 1px solid #4A4A2E;
          border-radius: 4px;
          background: #0A0A0A;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }
        .check-box:checked { background: #D4AF37; border-color: #D4AF37; }
        .check-box:checked::after {
          content: '';
          position: absolute;
          left: 5px;
          top: 1px;
          width: 5px;
          height: 10px;
          border: solid #0A0A0A;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.25em", color: "#D4AF37" }}>
            MARSHALL // HUB
          </div>
          <button
            onClick={() => setEntered(false)}
            style={{
              background: "#111113",
              border: "1px solid #2A2A2E",
              color: "#9A9AA2",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            ← Lobby
          </button>
        </div>

        <TodayWidget />

        {/* Office corridor — doors */}
        <div style={{ fontSize: 10, color: "#5C5C62", letterSpacing: "0.2em", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          — CORRIDOR —
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 22, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                background: view === v ? "linear-gradient(180deg, #1A1710 0%, #0A0A0A 100%)" : "linear-gradient(180deg, #111113 0%, #0A0A0A 100%)",
                border: "1px solid " + (view === v ? "#D4AF37" : "#2A2A2E"),
                borderTop: `2px solid ${view === v ? "#D4AF37" : "#3A3A3E"}`,
                borderRadius: "3px 3px 1px 1px",
                padding: "14px 16px 10px",
                minWidth: 78,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: view === v ? "#D4AF37" : "#4A4A50",
                  boxShadow: view === v ? "0 0 5px 1px rgba(212,175,55,0.6)" : "none",
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.04em",
                  color: view === v ? "#D4AF37" : "#9A9AA2",
                  textTransform: "capitalize",
                  textAlign: "center",
                }}
              >
                {v}
              </span>
            </button>
          ))}
        </div>

        {view === "daily log" && (
          <div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "#9A9AA2", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What's going on? Wins, tasks, how you're feeling..."
                rows={5}
                style={{ ...inputStyle, resize: "vertical", padding: 12 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <span style={{ fontSize: 11, color: "#9A9AA2" }}>
                  {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : ""}
                </span>
                <button onClick={saveEntry} style={primaryBtn}>
                  Add entry
                </button>
              </div>
            </div>

            {entries[todayKey()] && entries[todayKey()].items.length > 0 && (
              <div>
                <div style={labelStyle}>TODAY'S ENTRIES</div>
                {[...entries[todayKey()].items].reverse().map((item, i) => (
                  <div key={i} style={{ ...cardStyle, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#D4AF37", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                      {item.time}
                    </div>
                    <div style={{ fontSize: 13, color: "#E4E2DC", whiteSpace: "pre-wrap" }}>{item.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "health" && (
          <div>
            {/* Hologram with bio stats around it */}
            <div style={{ position: "relative", height: 260, marginBottom: 8 }}>
              <div style={{ position: "absolute", top: 10, left: 0, textAlign: "left" }}>
                <div style={{ fontSize: 10, color: "#7A7A80", letterSpacing: "0.08em" }}>NAME</div>
                <div style={{ fontSize: 13, color: "#F5F3EC", fontWeight: 600 }}>{bodyStats.name}</div>
              </div>
              <div style={{ position: "absolute", top: 10, right: 0, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#7A7A80", letterSpacing: "0.08em" }}>HEIGHT</div>
                <div style={{ fontSize: 13, color: "#F5F3EC", fontWeight: 600 }}>{bodyStats.height}</div>
              </div>
              <div style={{ position: "absolute", bottom: 10, left: 0, textAlign: "left" }}>
                <div style={{ fontSize: 10, color: "#7A7A80", letterSpacing: "0.08em" }}>WEIGHT</div>
                <div style={{ fontSize: 13, color: "#D4AF37", fontWeight: 600 }}>{bodyStats.weight} lbs</div>
              </div>
              <div style={{ position: "absolute", bottom: 10, right: 0, textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#7A7A80", letterSpacing: "0.08em" }}>EYES / HAIR</div>
                <div style={{ fontSize: 13, color: "#F5F3EC", fontWeight: 600 }}>{bodyStats.eyeColor} / {bodyStats.hairColor}</div>
              </div>
              <HologramBody />
            </div>

            {/* Editable bio stats */}
            <div style={{ ...cardStyle, marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 4 }}>Name</div>
                  <input value={bodyStats.name} onChange={(e) => saveBodyStats({ ...bodyStats, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 4 }}>Height</div>
                  <input value={bodyStats.height} onChange={(e) => saveBodyStats({ ...bodyStats, height: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 4 }}>Weight</div>
                  <input value={bodyStats.weight} onChange={(e) => saveBodyStats({ ...bodyStats, weight: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 4 }}>Eye Color</div>
                  <input value={bodyStats.eyeColor} onChange={(e) => saveBodyStats({ ...bodyStats, eyeColor: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 4 }}>Hair Color</div>
                <input value={bodyStats.hairColor} onChange={(e) => saveBodyStats({ ...bodyStats, hairColor: e.target.value })} style={inputStyle} />
              </div>
            </div>

            {/* Active peptides — names only */}
            <div style={labelStyle}>ACTIVE PEPTIDES</div>
            <div style={{ ...cardStyle, marginBottom: 18 }}>
              {peptideNames.map((name, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: i > 0 ? "1px solid #2A2A2E" : "none" }}>
                  <span style={{ fontSize: 14, color: "#E4E2DC" }}>{name}</span>
                  <button
                    onClick={() => removePeptideName(i)}
                    style={{ background: "none", border: "none", color: "#5C5C62", cursor: "pointer", fontSize: 18 }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input
                  value={newPeptideName}
                  onChange={(e) => setNewPeptideName(e.target.value)}
                  placeholder="Add a peptide"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addPeptideName} style={{ ...primaryBtn, background: "#2A2A2E", color: "#E8CE7A" }}>
                  + Add
                </button>
              </div>
            </div>

            {/* Daily intake form */}
            <div style={labelStyle}>TODAY'S INTAKE FORM</div>
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 8, letterSpacing: "0.06em" }}>DOSAGES TAKEN</div>
              {peptideNames.length === 0 && (
                <div style={{ fontSize: 12, color: "#5C5C62", marginBottom: 10 }}>Add a peptide above first.</div>
              )}
              {peptideNames.map((name, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#E4E2DC", flex: 1 }}>{name}</span>
                  <input
                    value={dosageForm[name] || ""}
                    onChange={(e) => setDosageForm({ ...dosageForm, [name]: e.target.value })}
                    placeholder="Dosage"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              ))}

              <div style={{ fontSize: 11, color: "#9A9AA2", marginTop: 18, marginBottom: 8, letterSpacing: "0.06em" }}>
                FOOD & DRINKS — {todayCalories} CAL
              </div>
              {foodForm.map((f, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #2A2A2E" }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input
                      value={f.item}
                      onChange={(e) => updateFoodRow(i, "item", e.target.value)}
                      placeholder="Food or drink"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      onClick={() => removeFoodRow(i)}
                      style={{ background: "none", border: "none", color: "#5C5C62", cursor: "pointer", fontSize: 18 }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    <input type="number" value={f.calories} onChange={(e) => updateFoodRow(i, "calories", e.target.value)} placeholder="Cal" style={{ ...inputStyle, fontSize: 12 }} />
                    <input type="number" value={f.protein} onChange={(e) => updateFoodRow(i, "protein", e.target.value)} placeholder="Pg" style={{ ...inputStyle, fontSize: 12 }} />
                    <input type="number" value={f.carbs} onChange={(e) => updateFoodRow(i, "carbs", e.target.value)} placeholder="Cg" style={{ ...inputStyle, fontSize: 12 }} />
                    <input type="number" value={f.fat} onChange={(e) => updateFoodRow(i, "fat", e.target.value)} placeholder="Fg" style={{ ...inputStyle, fontSize: 12 }} />
                  </div>
                </div>
              ))}
              <button onClick={addFoodRow} style={{ ...primaryBtn, background: "#2A2A2E", color: "#E8CE7A", marginBottom: 18 }}>
                + Add item
              </button>

              <div style={{ fontSize: 11, color: "#9A9AA2", marginBottom: 8, letterSpacing: "0.06em" }}>WORKOUT</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {WORKOUT_PLAN.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setSelectedWorkoutDay(d.day)}
                    style={{
                      background: selectedWorkoutDay === d.day ? "#D4AF37" : "#0A0A0A",
                      color: selectedWorkoutDay === d.day ? "#0A0A0A" : "#9A9AA2",
                      border: "1px solid " + (selectedWorkoutDay === d.day ? "#D4AF37" : "#2A2A2E"),
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>
              {(() => {
                const d = WORKOUT_PLAN.find((x) => x.day === selectedWorkoutDay);
                if (!d) return null;
                return (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F3EC", marginBottom: 10 }}>
                      Day {d.day} — {d.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {d.exercises.map((ex, i) => {
                        const id = `${d.day}-${i}`;
                        return (
                          <label key={id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                            <input type="checkbox" className="check-box" checked={!!exerciseChecks[id]} onChange={() => toggleExercise(id)} />
                            <span style={{ fontSize: 13, color: exerciseChecks[id] ? "#5C5C62" : "#E4E2DC", textDecoration: exerciseChecks[id] ? "line-through" : "none" }}>
                              {ex}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button onClick={newHealthForm} style={{ ...primaryBtn, background: "#2A2A2E", color: "#E4E2DC" }}>
                  New form
                </button>
                <button onClick={saveHealthForm} style={primaryBtn}>
                  Save
                </button>
              </div>
            </div>

            {healthDates.length > 0 && (
              <div>
                <div style={labelStyle}>SAVED FORMS</div>
                {healthDates.map((d) => (
                  <div key={d} style={{ ...cardStyle, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#D4AF37", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                      {new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                    {health[d].map((snap, i) => (
                      <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < health[d].length - 1 ? "1px solid #2A2A2E" : "none" }}>
                        <div style={{ fontSize: 10, color: "#9A9AA2", marginBottom: 4 }}>{snap.time}</div>
                        <div style={{ fontSize: 12.5, color: "#E4E2DC" }}>
                          {snap.weight ? `${snap.weight} lbs` : ""}{snap.height ? ` · ${snap.height}` : ""}
                        </div>
                        {snap.dosages && snap.dosages.length > 0 && (
                          <div style={{ fontSize: 12, color: "#E8CE7A", marginTop: 4 }}>
                            {snap.dosages.map((p) => `${p.name}: ${p.dosage}`).join(", ")}
                          </div>
                        )}
                        {snap.food && snap.food.length > 0 && (
                          <div style={{ fontSize: 12, color: "#9A9AA2", marginTop: 4 }}>
                            {snap.food.map((f) => `${f.item} (${f.calories || 0} cal)`).join(", ")}
                          </div>
                        )}
                        {snap.workoutTitle && (
                          <div style={{ fontSize: 12, color: "#9A9AA2", marginTop: 4 }}>
                            Day {snap.workoutDay} — {snap.workoutTitle}
                            {snap.exercisesDone && snap.exercisesDone.length > 0
                              ? `: ${snap.exercisesDone.length} exercise${snap.exercisesDone.length === 1 ? "" : "s"} done`
                              : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "daily tasks" && (
          <div>
            <p style={{ fontSize: 13, color: "#9A9AA2", margin: "0 0 20px" }}>
              7 nights to a fully live AI ecosystem.
            </p>
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#9A9AA2", marginBottom: 6 }}>
                <span>PROGRESS</span>
                <span style={{ color: "#D4AF37" }}>{doneTasks}/{totalTasks} · {pct}%</span>
              </div>
              <div style={{ height: 6, background: "#0A0A0A", borderRadius: 3, overflow: "hidden", border: "1px solid #2A2A2E" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: "linear-gradient(90deg, #8A6D1F, #D4AF37)",
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
                      background: nightDone ? "#D4AF37" : "#0A0A0A",
                      border: `1px solid ${nightDone ? "#D4AF37" : nightStarted ? "#D4AF37" : "#3A3A3E"}`,
                      animation: nightDone ? "glowPulse 2.2s ease-in-out infinite" : "none",
                    }}
                  />
                  <div
                    style={{
                      background: "linear-gradient(180deg, #111113 0%, #080808 100%)",
                      border: `1px solid ${nightDone ? "#4A4A2E" : "#2A2A2E"}`,
                      borderLeft: `2px solid ${nightDone ? "#D4AF37" : nightStarted ? "#D4AF37" : "#3A3A3E"}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: nightDone ? "#D4AF37" : "#9A9AA2", letterSpacing: "0.1em" }}>
                        NIGHT {night.night}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5C5C62" }}>
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
                              color: checked[t.id] ? "#5C5C62" : "#E4E2DC",
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
              <div style={{ fontSize: 13, color: "#5C5C62", textAlign: "center", marginTop: 20 }}>
                No history yet — write a log or check off a task today.
              </div>
            )}
            {historyDates.map((d) => {
              const entry = entries[d];
              const tasksDone = dailyLog[d] || [];
              return (
                <div key={d} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#D4AF37", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                    {entry ? `Day ${entry.day} · ` : ""}
                    {new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  {entry && entry.items.map((item, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "#9A9AA2", marginBottom: 2 }}>{item.time}</div>
                      <div style={{ fontSize: 13, color: "#E4E2DC", whiteSpace: "pre-wrap" }}>{item.text}</div>
                    </div>
                  ))}
                  {tasksDone.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: "#9A9AA2", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                        TASKS COMPLETED
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {tasksDone.map((t) => (
                          <div key={t.id} style={{ fontSize: 12.5, color: "#E8CE7A", display: "flex", gap: 6 }}>
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
