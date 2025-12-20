const lengthInput = document.getElementById("lengthInput");
const lowerCheckbox = document.getElementById("lowerCheckbox");
const upperCheckbox = document.getElementById("upperCheckbox");
const digitsCheckbox = document.getElementById("digitsCheckbox");
const symbolsCheckbox = document.getElementById("symbolsCheckbox");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const passwordInput = document.getElementById("passwordInput");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const message = document.getElementById("message");
const strengthLabel = document.getElementById("strengthLabel");
const scoreText = document.getElementById("scoreText");
const progressBar = document.getElementById("progressBar");
const checksEl = document.getElementById("checks");
const tipsEl = document.getElementById("tips");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const HISTORY_KEY = "pgen_xyz_history_v1";
const HISTORY_LIMIT = 10;
const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{};:,.<>/?~"
};
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function getSelectedPools() {
  const pools = [];
  if (lowerCheckbox.checked) pools.push(SETS.lower);
  if (upperCheckbox.checked) pools.push(SETS.upper);
  if (digitsCheckbox.checked) pools.push(SETS.digits);
  if (symbolsCheckbox.checked) pools.push(SETS.symbols);
  return pools;
}
function randomChar(str) {
  return str[Math.floor(Math.random() * str.length)];
}
function setMessage(text) {
  if (!message) return;
  message.textContent = text || "";
}
function generatePassword() {
  const pools = getSelectedPools();
  if (pools.length === 0) {
    setMessage("Select at least one character set.");
    return "";
  }
  let len = parseInt(lengthInput.value, 10);
  if (Number.isNaN(len)) len = 12;
  len = clamp(len, 4, 64);

  if (len < pools.length) len = pools.length;
  lengthInput.value = String(len);

  const chars = [];


  for (const pool of pools) chars.push(randomChar(pool));

  const all = pools.join("");
  while (chars.length < len) chars.push(randomChar(all));
  shuffleArray(chars);
  setMessage("Password generated.");
  return chars.join("");
}
function analyzePassword(pw) {
  const result = {
    score: 0,
    level: "—",
    checks: [],
    tips: []
  };
  if (!pw || pw.length === 0) {
    result.tips.push("Type a password to see analysis.");
    return result;
  }
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  const hasRepeat = /(.)\1{2,}/.test(pw); // aaa / 111


  const len = pw.length;
  let score = 0;

  if (len >= 8) score += 20; else result.tips.push("Use at least 8 characters.");
  if (len >= 12) score += 20; else result.tips.push("12+ characters is much better.");
  if (len >= 16) score += 10;


  if (hasLower) score += 10; else result.tips.push("Add lowercase letters.");
  if (hasUpper) score += 10; else result.tips.push("Add uppercase letters.");
  if (hasDigit) score += 10; else result.tips.push("Add digits.");
  if (hasSymbol) score += 15; else result.tips.push("Add symbols for stronger passwords.");


  if (hasRepeat) {
    score -= 10;
    result.tips.push("Avoid repeating characters like aaa or 111.");
  }


  const typeCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  if (typeCount <= 1) {
    score -= 12;
    result.tips.push("Mix different character types.");
  }
  score = clamp(score, 0, 100);


  let level = "Weak";
  if (score >= 70) level = "Strong";
  else if (score >= 40) level = "Medium";
  result.score = score;
  result.level = level;


  result.checks = [
    { ok: len >= 8, label: "Length ≥ 8" },
    { ok: len >= 12, label: "Length ≥ 12" },
    { ok: hasLower, label: "Lowercase letters" },
    { ok: hasUpper, label: "Uppercase letters" },
    { ok: hasDigit, label: "Digits" },
    { ok: hasSymbol, label: "Symbols" },
    { ok: !hasRepeat, label: "No repeats (aaa/111)" }
  ];


  if (result.tips.length === 0) result.tips.push("Looks good. Consider using a password manager.");

  return result;
}
function renderAnalysis(pw) {
  const data = analyzePassword(pw);
  if (strengthLabel) strengthLabel.textContent = data.level;
  if (scoreText) scoreText.textContent = `${data.score}/100`;
  if (progressBar) {
    progressBar.style.width = `${data.score}%`;
  }
  if (checksEl) {
    checksEl.innerHTML = "";
    for (const c of data.checks) {
      const div = document.createElement("div");
      div.className = c.ok ? "ok" : "bad";
      div.textContent = `${c.ok ? "✓" : "✗"} ${c.label}`;
      checksEl.appendChild(div);
    }
  }
  if (tipsEl) {
    tipsEl.innerHTML = "";
    for (const t of data.tips) {
      const li = document.createElement("li");
      li.textContent = t;
      tipsEl.appendChild(li);
    }
  }
}
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}
function renderHistory() {
  if (!historyList) return;
  const items = loadHistory();
  historyList.innerHTML = "";
  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "hint";
    empty.textContent = "No saved passwords yet.";
    historyList.appendChild(empty);
    return;
  }
  for (const pw of items) {
    const row = document.createElement("div");
    row.className = "historyItem";
    const left = document.createElement("div");
    left.className = "mono";
    left.textContent = pw;
    const right = document.createElement("button");
    right.className = "btn";
    right.type = "button";
    right.textContent = "Use";
    right.addEventListener("click", () => {
      passwordInput.value = pw;
      setMessage("Loaded from history.");
      renderAnalysis(pw);
    });
    row.appendChild(left);
    row.appendChild(right);
    historyList.appendChild(row);
  }
}
async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {

    const tmp = document.createElement("textarea");
    tmp.value = text;
    tmp.style.position = "fixed";
    tmp.style.left = "-9999px";
    document.body.appendChild(tmp);
    tmp.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(tmp);
    return ok;
  }
}


generateBtn?.addEventListener("click", () => {
  const pw = generatePassword();
  if (!pw) return;
  passwordInput.value = pw;
  renderAnalysis(pw);
});
clearBtn?.addEventListener("click", () => {
  passwordInput.value = "";
  setMessage("Cleared.");
  renderAnalysis("");
});
passwordInput?.addEventListener("input", () => {
  setMessage("");
  renderAnalysis(passwordInput.value);
});
copyBtn?.addEventListener("click", async () => {
  const pw = passwordInput.value.trim();
  if (!pw) {
    setMessage("Nothing to copy.");
    return;
  }
  const ok = await copyToClipboard(pw);
  setMessage(ok ? "Copied to clipboard." : "Copy failed (browser blocked).");
});
saveBtn?.addEventListener("click", () => {
  const pw = passwordInput.value.trim();
  if (!pw) {
    setMessage("Nothing to save.");
    return;
  }
  const items = loadHistory();
  const next = [pw, ...items.filter(x => x !== pw)].slice(0, HISTORY_LIMIT);
  saveHistory(next);
  setMessage("Saved to history.");
  renderHistory();
});
clearHistoryBtn?.addEventListener("click", () => {
  saveHistory([]);
  setMessage("History cleared.");
  renderHistory();
});

renderHistory();
renderAnalysis("");
