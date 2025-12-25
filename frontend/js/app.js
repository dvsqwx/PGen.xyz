const API_BASE = "http://localhost:5050";
const API_KEY = "pgen_demo_key_123";
const HISTORY_KEY = "pgen_history_v1";
const HISTORY_LIMIT = 10;

const lengthInput = document.getElementById("lengthInput");
const lowerCheckbox = document.getElementById("lowerCheckbox");
const upperCheckbox = document.getElementById("upperCheckbox");
const digitsCheckbox = document.getElementById("digitsCheckbox");
const symbolsCheckbox = document.getElementById("symbolsCheckbox");

const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const passwordInput = document.getElementById("passwordInput");
const messageEl = document.getElementById("message");

const historyList = document.getElementById("historyList");

const strengthLabel = document.getElementById("strengthLabel");
const scoreText = document.getElementById("scoreText");
const progressBar = document.getElementById("progressBar");
const checksEl = document.getElementById("checks");
const tipsEl = document.getElementById("tips");


let msgTimer = null;

function setMessage(text) {
  if (!messageEl) return;
  messageEl.textContent = text || "";
  if (msgTimer) clearTimeout(msgTimer);
  if (text) {
    msgTimer = setTimeout(() => {
      messageEl.textContent = "";
    }, 2200);
  }
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function uniqCharsCount(str) {
  return new Set(str.split("")).size;
}

function hasLower(s) { return /[a-z]/.test(s); }
function hasUpper(s) { return /[A-Z]/.test(s); }
function hasDigit(s) { return /[0-9]/.test(s); }
function hasSymbol(s) { return /[^a-zA-Z0-9]/.test(s); }

function estimatePoolSize(opts) {
  let pool = 0;
  if (opts.lower) pool += 26;
  if (opts.upper) pool += 26;
  if (opts.digits) pool += 10;
  if (opts.symbols) pool += 32;
  return pool;
}

function entropyBits(length, poolSize) {
  if (length <= 0 || poolSize <= 1) return 0;
  return Math.log2(Math.pow(poolSize, length));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...(options.headers || {})
    }
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function tryLoadSettingsFromServer() {
  try {
    const s = await api("/api/settings");
    if(lengthInput) lengthInput.value = s.length;
    if(lowerCheckbox) lowerCheckbox.checked = !!s.lower;
    if(upperCheckbox) upperCheckbox.checked = !!s.upper;
    if(digitsCheckbox) digitsCheckbox.checked = !!s.digits;
    if(symbolsCheckbox) symbolsCheckbox.checked = !!s.symbols;
  } catch {
  }
}

async function pushSettingsToServer() {
  try {
    await api("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        length: parseInt(lengthInput.value, 10),
        lower: lowerCheckbox.checked,
        upper: upperCheckbox.checked,
        digits: digitsCheckbox.checked,
        symbols: symbolsCheckbox.checked
      })
    });
  } catch { }
}

function loadHistoryLocal() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveHistoryLocal(arr) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, HISTORY_LIMIT)));
  } catch { }
}

function addToHistoryLocal(pw) {
  const arr = loadHistoryLocal();
  const next = [pw, ...arr.filter(x => x !== pw)].slice(0, HISTORY_LIMIT);
  saveHistoryLocal(next);
}

function clearHistoryLocal() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch { }
}

async function getHistory() {
  try {
    const rows = await api("/api/history");
    return rows.map(r => r.password);
  } catch {
    return loadHistoryLocal();
  }
}

async function addHistory(pw) {
  try {
    await api("/api/history", { method: "POST", body: JSON.stringify({ password: pw }) });
    return true;
  } catch {
    addToHistoryLocal(pw);
    return false;
  }
}

async function clearHistoryAll() {
  try {
    await api("/api/history", { method: "DELETE" });
    return true;
  } catch {
    clearHistoryLocal();
    return false;
  }
}


function buildAlphabet() {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>?/~|";

  let pool = "";
  if (lowerCheckbox?.checked) pool += lower;
  if (upperCheckbox?.checked) pool += upper;
  if (digitsCheckbox?.checked) pool += digits;
  if (symbolsCheckbox?.checked) pool += symbols;
  return pool;
}

function randomChar(str) {
  const idx = Math.floor(Math.random() * str.length);
  return str[idx];
}

function generatePassword(len) {
  const pool = buildAlphabet();
  if (!pool.length) return "";

  const required = [];
  if (lowerCheckbox?.checked) required.push("abcdefghijklmnopqrstuvwxyz");
  if (upperCheckbox?.checked) required.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (digitsCheckbox?.checked) required.push("0123456789");
  if (symbolsCheckbox?.checked) required.push("!@#$%^&*()-_=+[]{};:,.<>?/~|");

  const chars = [];

  for (const group of required) {
    if (chars.length < len) chars.push(randomChar(group));
  }

  while (chars.length < len) chars.push(randomChar(pool));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

function analyzePassword(pw) {
  const length = pw.length;

  const checks = {
    length8: length >= 8,
    length12: length >= 12,
    lower: hasLower(pw),
    upper: hasUpper(pw),
    digits: hasDigit(pw),
    symbols: hasSymbol(pw),
    noRepeatHeavy: uniqCharsCount(pw) >= Math.max(6, Math.floor(length * 0.6))
  };

  let score = 0;

  if (length >= 8) score += 20;
  if (length >= 12) score += 20;
  if (length >= 16) score += 10;

  const variety = [checks.lower, checks.upper, checks.digits, checks.symbols].filter(Boolean).length;
  score += variety * 10;

  if (!checks.noRepeatHeavy && length >= 8) score -= 10;
  score = clamp(score, 0, 100);

  let label = "Very weak";
  if (score >= 80) label = "Strong";
  else if (score >= 60) label = "Good";
  else if (score >= 40) label = "Medium";
  else if (score >= 20) label = "Weak";

  const tips = [];
  if (length < 12) tips.push("Increase length to at least 12 characters.");
  if (!checks.lower) tips.push("Add lowercase letters (a–z).");
  if (!checks.upper) tips.push("Add uppercase letters (A–Z).");
  if (!checks.digits) tips.push("Add digits (0–9).");
  if (!checks.symbols) tips.push("Add symbols (!@#...).");
  if (!checks.noRepeatHeavy) tips.push("Avoid repeating chars.");

  const guessed = {
    lower: checks.lower,
    upper: checks.upper,
    digits: checks.digits,
    symbols: checks.symbols
  };
  const pool = estimatePoolSize(guessed);
  const bits = entropyBits(length, pool);

  return { score, label, checks, tips, entropy: bits };
}

function renderChecks(checks) {
  if (!checksEl) return;
  const rows = [
    { ok: checks.length8, text: "Length ≥ 8" },
    { ok: checks.length12, text: "Length ≥ 12" },
    { ok: checks.lower, text: "Has lowercase" },
    { ok: checks.upper, text: "Has uppercase" },
    { ok: checks.digits, text: "Has digits" },
    { ok: checks.symbols, text: "Has symbols" },
    { ok: checks.noRepeatHeavy, text: "No repetition" }
  ];

  checksEl.innerHTML = rows.map(r => {
    const cls = r.ok ? "ok" : "bad"; // Ensure CSS has .ok / .bad or adapt
    const mark = r.ok ? "✓" : "—";
    const color = r.ok ? "#b9ff2a" : "rgba(255,255,255,0.3)";
    return `<div style="color:${color}">${mark} ${r.text}</div>`;
  }).join("");
}

function renderTips(tips, entropy) {
  if (!tipsEl) return;
  const list = tips.slice();
  list.unshift(`Entropy: ~${Math.round(entropy)} bits`);
  tipsEl.innerHTML = list.map(t => `<li>${escapeHtml(t)}</li>`).join("");
}

function renderAnalysis(pw) {
  const a = analyzePassword(pw);

  if (strengthLabel) strengthLabel.textContent = a.label;
  if (scoreText) scoreText.textContent = `${a.score}/100`;
  if (progressBar) progressBar.style.width = `${a.score}%`;

  renderChecks(a.checks);
  renderTips(a.tips, a.entropy);
}

async function renderHistory() {
  if (!historyList) return;
  const items = await getHistory();

  if (!items.length) {
    historyList.innerHTML = `<div class="smallText" style="padding:10px;">No saved passwords yet.</div>`;
    return;
  }

  historyList.innerHTML = items.map((pw) => {
    const safe = escapeHtml(pw);
    return `
      <div class="historyItem">
        <div class="mono">${safe.substring(0, 16)}${safe.length>16?"...":""}</div>
        <div class="row" style="gap:8px;">
          <button class="btn btnGhost histUse" type="button" data-pw="${safe}">Use</button>
          <button class="btn btnGhost histCopy" type="button" data-pw="${safe}">Copy</button>
        </div>
      </div>
    `;
  }).join("");

  historyList.querySelectorAll(".histUse").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pw = btn.getAttribute("data-pw") || "";
      if(passwordInput) passwordInput.value = pw;
      renderAnalysis(pw);
      setMessage("Loaded from history.");
    });
  });

  historyList.querySelectorAll(".histCopy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pw = btn.getAttribute("data-pw") || "";
      try {
        await navigator.clipboard.writeText(pw);
        setMessage("Copied.");
      } catch {
        setMessage("Copy failed.");
      }
    });
  });
}

function getLen() {
  const n = parseInt(lengthInput?.value, 10);
  return clamp(Number.isFinite(n) ? n : 12, 4, 64);
}


generateBtn?.addEventListener("click", () => {
  const len = getLen();
  const pool = buildAlphabet();
  if (!pool.length) {
    setMessage("Select at least one option.");
    return;
  }
  const pw = generatePassword(len);
  passwordInput.value = pw;
  renderAnalysis(pw);
  setMessage("Generated.");
});

clearBtn?.addEventListener("click", () => {
  passwordInput.value = "";
  renderAnalysis("");
  setMessage("Cleared.");
});

copyBtn?.addEventListener("click", async () => {
  const pw = passwordInput.value.trim();
  if (!pw) {
    setMessage("Nothing to copy.");
    return;
  }
  try {
    await navigator.clipboard.writeText(pw);
    setMessage("Copied to clipboard.");
  } catch {
    setMessage("Copy failed.");
  }
});

saveBtn?.addEventListener("click", async () => {
  const pw = passwordInput.value.trim();
  if (!pw) {
    setMessage("Nothing to save.");
    return;
  }
  const savedToServer = await addHistory(pw);
  await renderHistory();
  setMessage(savedToServer ? "Saved to server." : "Saved locally.");
});

clearHistoryBtn?.addEventListener("click", async () => {
  const ok = await clearHistoryAll();
  await renderHistory();
  setMessage(ok ? "Server history cleared." : "Local history cleared.");
});

passwordInput?.addEventListener("input", () => {
  renderAnalysis(passwordInput.value);
});

[lengthInput, lowerCheckbox, upperCheckbox, digitsCheckbox, symbolsCheckbox].forEach((el) => {
  el?.addEventListener("change", () => {
    if (el === lengthInput) lengthInput.value = String(getLen());
    pushSettingsToServer();
  });
});


const emailInput = document.getElementById("emailInput");
const domainSelect = document.getElementById("domainSelect");
const genEmailBtn = document.getElementById("genEmailBtn");
const copyEmailBtn = document.getElementById("copyEmailBtn");

const commonDomains = [
  "gmail.com", 
  "yahoo.com", 
  "outlook.com", 
  "proton.me", 
  "icloud.com", 
  "yandex.ru"
];

function generateMailLogin(len = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const letters = "abcdefghijklmnopqrstuvwxyz";
  // First char always letter
  result += letters.charAt(Math.floor(Math.random() * letters.length));
  
  for (let i = 1; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

if (genEmailBtn) {
  genEmailBtn.addEventListener("click", () => {
    const randomLen = Math.floor(Math.random() * 5) + 8; // 8-12 chars
    const login = generateMailLogin(randomLen);
    
    let domain = domainSelect.value;
    if (domain === "random") {
      domain = commonDomains[Math.floor(Math.random() * commonDomains.length)];
    }

    const email = `${login}@${domain}`;
    if (emailInput) emailInput.value = email;
    setMessage("Email generated.");
  });
}

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", async () => {
    const txt = emailInput?.value;
    if (!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      setMessage("Email copied.");
    } catch {
      setMessage("Copy failed.");
    }
  });
}

(async () => {
  renderAnalysis(passwordInput?.value || "");
  await tryLoadSettingsFromServer();
  await renderHistory();
})();
