const lengthInput = document.getElementById("lengthInput");
const lowerCheckbox = document.getElementById("lowerCheckbox");
const upperCheckbox = document.getElementById("upperCheckbox");
const digitsCheckbox = document.getElementById("digitsCheckbox");
const symbolsCheckbox = document.getElementById("symbolsCheckbox");
const passwordInput = document.getElementById("passwordInput");
const messageEl = document.getElementById("message");
const generateBtn = document.getElementById("generateBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const saveBtn = document.getElementById("saveBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const strengthLabel = document.getElementById("strengthLabel");
const scoreText = document.getElementById("scoreText");
const progressBar = document.getElementById("progressBar");
const tipsList = document.getElementById("tips");
const checksContainer = document.getElementById("checks");
const historyList = document.getElementById("historyList");
function showMessage(text) {
  messageEl.textContent = text;
  clearTimeout(showMessage._t);
  showMessage._t = setTimeout(() => {
    messageEl.textContent = "";
  }, 1700);
}
function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}
function randomInt(max) {
  return Math.floor(Math.random() * max);
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.?/<>";
function buildCharset() {
  let chars = "";
  if (lowerCheckbox.checked) chars += LOWER;
  if (upperCheckbox.checked) chars += UPPER;
  if (digitsCheckbox.checked) chars += DIGITS;
  if (symbolsCheckbox.checked) chars += SYMBOLS;
  return chars;
}
function generatePassword() {
  let length = parseInt(lengthInput.value, 10);
  if (Number.isNaN(length)) length = 12;
  length = clamp(length, 4, 64);
  lengthInput.value = length;
  const groups = [];
  if (lowerCheckbox.checked) groups.push(LOWER);
  if (upperCheckbox.checked) groups.push(UPPER);
  if (digitsCheckbox.checked) groups.push(DIGITS);
  if (symbolsCheckbox.checked) groups.push(SYMBOLS);
  if (groups.length === 0) {
    showMessage("Оберіть хоча б один набір символів");
    return "";
  }
  if (length < groups.length) {
    length = groups.length;
    lengthInput.value = length;
    showMessage("Довжину автоматично збільшено");
  }
  const result = [];
  for (const g of groups) {
    result.push(g[randomInt(g.length)]);
  }
  const all = buildCharset();
  while (result.length < length) {
    result.push(all[randomInt(all.length)]);
  }
  return shuffle(result).join("");
}
function analyzePassword(password) {
  const tips = [];
  const checks = [];
  if (!password) {
    return {
      score: 0,
      label: "—",
      color: "#999",
      tips: ["Введіть пароль або згенеруйте його"],
      checks: []
    };
  }
  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const hasRepeat = /(.)\1{2,}/.test(password);
  const typeCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasDigit ? 1 : 0) + (hasSymbol ? 1 : 0);
  const onlyOneType = typeCount <= 1;
  let score = 0;
  if (len >= 8) score += 25;
  if (len >= 12) score += 25;
  if (len >= 16) score += 10;
  if (hasDigit) score += 10;
  if (hasSymbol) score += 15;
  if (hasLower && hasUpper) score += 15;
  if (hasRepeat) score -= 15;
  if (onlyOneType) score -= 20;
  score = clamp(score, 0, 100);
  let label = "Слабкий";
  let color = "#ef4444";
  if (score >= 70) {
    label = "Сильний";
    color = "#23c55e";
  } else if (score >= 40) {
    label = "Середній";
    color = "#f59e0b";
  }
  checks.push({ ok: len >= 8, text: "Мінімум 8 символів" });
  checks.push({ ok: len >= 12, text: "Рекомендовано 12+ символів" });
  checks.push({ ok: hasDigit, text: "Містить цифри" });
  checks.push({ ok: hasSymbol, text: "Містить спецсимволи" });
  checks.push({ ok: hasLower, text: "Містить малі літери" });
  checks.push({ ok: hasUpper, text: "Містить великі літери" });
  checks.push({ ok: !hasRepeat, text: "Немає повторів типу aaa/111" });
  if (len < 12) tips.push("Збільште довжину (12–16 символів).");
  if (!hasDigit) tips.push("Додайте цифри (0–9).");
  if (!hasSymbol) tips.push("Додайте спецсимволи (наприклад !@#).");
  if (!(hasLower && hasUpper)) tips.push("Змішайте великі та малі літери.");
  if (hasRepeat) tips.push("Уникайте повторів однакових символів підряд.");
  if (onlyOneType) tips.push("Використовуйте 2–3 типи символів.");
  if (tips.length === 0) {
    tips.push("Пароль виглядає достатньо надійним. Не використовуйте один пароль всюди.");
  }
  return { score, label, color, tips, checks };
}
function renderAnalysis() {
  const data = analyzePassword(passwordInput.value);
  strengthLabel.textContent = data.label;
  scoreText.textContent = `${data.score}/100`;
  progressBar.style.width = data.score + "%";
  progressBar.style.background = data.color;
  checksContainer.innerHTML = "";
  data.checks.forEach((c) => {
    const div = document.createElement("div");
    div.className = c.ok ? "ok" : "bad";
    div.textContent = (c.ok ? "✔ " : "✖ ") + c.text;
    checksContainer.appendChild(div);
  });
  tipsList.innerHTML = "";
  data.tips.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    tipsList.appendChild(li);
  });
}
const HISTORY_KEY = "password_lab_history_v1";
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveHistory(arr) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
}
function addToHistory(password) {
  if (!password) return;
  const arr = loadHistory();
  if (arr.length > 0 && arr[0] === password) return;
  arr.unshift(password);
  if (arr.length > 10) arr.length = 10;
  saveHistory(arr);
}
function renderHistory() {
  const arr = loadHistory();
  historyList.innerHTML = "";
  if (arr.length === 0) {
    const div = document.createElement("div");
    div.className = "hint";
    div.textContent = "Історія порожня.";
    historyList.appendChild(div);
    return;
  }
  arr.forEach((pwd) => {
    const item = document.createElement("div");
    item.className = "historyItem";
    const left = document.createElement("div");
    left.className = "mono";
    left.textContent = pwd;
    const useBtn = document.createElement("button");
    useBtn.className = "btnGhost";
    useBtn.textContent = "Використати";
    useBtn.addEventListener("click", () => {
      passwordInput.value = pwd;
      renderAnalysis();
      showMessage("Пароль підставлено з історії");
    });
    item.appendChild(left);
    item.appendChild(useBtn);
    historyList.appendChild(item);
  });
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      passwordInput.focus();
      passwordInput.select();
      const ok = document.execCommand("copy");
      passwordInput.setSelectionRange(text.length, text.length);
      return ok;
    } catch {
      return false;
    }
  }
}
generateBtn.addEventListener("click", () => {
  const pwd = generatePassword();
  if (pwd) {
    passwordInput.value = pwd;
    renderAnalysis();
    showMessage("Пароль згенеровано");
  }
});
clearBtn.addEventListener("click", () => {
  passwordInput.value = "";
  renderAnalysis();
  showMessage("Очищено");
});
copyBtn.addEventListener("click", async () => {
  const pwd = passwordInput.value;
  if (!pwd) {
    showMessage("Нема що копіювати");
    return;
  }
  const ok = await copyToClipboard(pwd);
  showMessage(ok ? "Скопійовано в буфер" : "Не вдалося скопіювати");
});
saveBtn.addEventListener("click", () => {
  const pwd = passwordInput.value;
  if (!pwd) {
    showMessage("Спочатку введіть або згенеруйте пароль");
    return;
  }
  addToHistory(pwd);
  renderHistory();
  showMessage("Збережено в історію");
});
clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  showMessage("Історію очищено");
});
passwordInput.addEventListener("input", renderAnalysis);
renderAnalysis();
renderHistory();
