const STORAGE_KEY = "lotto_kawaii_history_v1";

function $(sel) {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

function clampInt(n, min, max, fallback) {
  const x = Number.parseInt(String(n), 10);
  if (Number.isNaN(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

function uniqSorted(nums) {
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

function parseNums(text) {
  if (!text || !text.trim()) return [];
  const parts = text
    .split(/[\s,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
  const nums = parts.map((p) => Number.parseInt(p, 10)).filter((n) => Number.isFinite(n));
  return nums;
}

function validateNums(nums, label, { maxLen } = { maxLen: Infinity }) {
  const bad = nums.filter((n) => !Number.isInteger(n) || n < 1 || n > 45);
  if (bad.length) {
    throw new Error(`${label}: 1~45 정수만 가능해요. (문제: ${uniqSorted(bad).join(", ")})`);
  }
  const unique = uniqSorted(nums);
  if (unique.length !== nums.length) {
    throw new Error(`${label}: 중복이 있어요. (중복 제거 후: ${unique.join(", ")})`);
  }
  if (unique.length > maxLen) {
    throw new Error(`${label}: 최대 ${maxLen}개까지 가능해요.`);
  }
  return unique;
}

function range1to45() {
  return Array.from({ length: 45 }, (_, i) => i + 1);
}

function shuffle(arr) {
  // Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickSet({ include, exclude }) {
  const inc = include.slice();
  if (inc.length > 6) throw new Error("고정(포함) 번호는 최대 6개예요.");
  const excSet = new Set(exclude);
  for (const n of inc) {
    if (excSet.has(n)) throw new Error(`포함 번호 ${n}가 제외 목록에도 있어요.`);
  }

  const pool = range1to45().filter((n) => !excSet.has(n) && !inc.includes(n));
  const need = 6 - inc.length;
  if (pool.length < need) throw new Error("조건이 너무 빡빡해서 6개를 채울 수 없어요.");

  shuffle(pool);
  const picked = inc.concat(pool.slice(0, need)).sort((a, b) => a - b);
  return picked;
}

function setColorClass(n) {
  // 귀여운 파스텔 5종(기존 색상 체계 유지)
  if (n <= 10) return "y1";
  if (n <= 20) return "b1";
  if (n <= 30) return "r1";
  if (n <= 40) return "g1";
  return "p1";
}

function formatLine(nums) {
  return nums.map((n) => String(n).padStart(2, "0")).join(" ");
}

function nowStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), 1800);
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object" && Array.isArray(x.sets));
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
}

function renderResults(sets) {
  const wrap = $("#results");
  wrap.innerHTML = "";

  if (!sets.length) return;

  sets.forEach((nums, idx) => {
    const row = document.createElement("div");
    row.className = "row";

    const left = document.createElement("div");
    left.className = "rowLeft";

    const index = document.createElement("div");
    index.className = "rowIndex";
    index.textContent = String(idx + 1);

    const balls = document.createElement("div");
    balls.className = "balls";

    nums.forEach((n) => {
      const ball = document.createElement("div");
      ball.className = `ball ${setColorClass(n)}`;
      ball.textContent = String(n);
      balls.appendChild(ball);
    });

    left.appendChild(index);
    left.appendChild(balls);

    const btn = document.createElement("button");
    btn.className = "smallBtn";
    btn.type = "button";
    btn.textContent = "복사";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(formatLine(nums));
        toast("한 세트 복사 완료!");
      } catch {
        toast("복사 실패(브라우저 권한 확인)");
      }
    });

    row.appendChild(left);
    row.appendChild(btn);
    wrap.appendChild(row);
  });
}

function renderHistory(items) {
  const wrap = $("#history");
  wrap.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "status";
    empty.textContent = "아직 저장된 히스토리가 없어요.";
    wrap.appendChild(empty);
    return;
  }

  items.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "historyItem";

    const top = document.createElement("div");
    top.className = "historyTop";

    const meta = document.createElement("div");
    meta.className = "historyMeta";
    meta.textContent = `${item.at} · ${item.sets.length}세트`;

    const btns = document.createElement("div");
    btns.className = "historyBtns";

    const useBtn = document.createElement("button");
    useBtn.className = "smallBtn";
    useBtn.type = "button";
    useBtn.textContent = "불러오기";
    useBtn.addEventListener("click", () => {
      state.sets = item.sets;
      renderResults(state.sets);
      setStatus("히스토리에서 불러왔어요.", "불러오기");
      toast("불러오기 완료!");
    });

    const delBtn = document.createElement("button");
    delBtn.className = "smallBtn";
    delBtn.type = "button";
    delBtn.textContent = "삭제";
    delBtn.addEventListener("click", () => {
      const next = loadHistory().filter((_, i) => i !== idx);
      saveHistory(next);
      renderHistory(next);
      toast("삭제 완료!");
    });

    btns.appendChild(useBtn);
    btns.appendChild(delBtn);
    top.appendChild(meta);
    top.appendChild(btns);

    const lines = document.createElement("div");
    lines.style.display = "grid";
    lines.style.gap = "8px";
    item.sets.forEach((nums, i) => {
      const line = document.createElement("div");
      line.className = "row";
      line.style.padding = "8px 10px";

      const left = document.createElement("div");
      left.className = "rowLeft";
      const index = document.createElement("div");
      index.className = "rowIndex";
      index.textContent = String(i + 1);
      const balls = document.createElement("div");
      balls.className = "balls";
      nums.forEach((n) => {
        const ball = document.createElement("div");
        ball.className = `ball ${setColorClass(n)}`;
        ball.textContent = String(n);
        balls.appendChild(ball);
      });
      left.appendChild(index);
      left.appendChild(balls);
      line.appendChild(left);
      lines.appendChild(line);
    });

    card.appendChild(top);
    card.appendChild(lines);
    wrap.appendChild(card);
  });
}

function setStatus(text, meta) {
  $("#status").textContent = text;
  $("#metaText").textContent = meta || "—";
}

const state = {
  sets: [],
};

async function copyAll() {
  if (!state.sets.length) {
    toast("복사할 결과가 없어요.");
    return;
  }
  const text = state.sets.map((s) => formatLine(s)).join("\n");
  try {
    await navigator.clipboard.writeText(text);
    toast("전체 복사 완료!");
  } catch {
    toast("복사 실패(브라우저 권한 확인)");
  }
}

function clearAll() {
  $("#includeNums").value = "";
  $("#excludeNums").value = "";
  state.sets = [];
  renderResults(state.sets);
  setStatus("초기화 완료!", "—");
}

function generate() {
  const count = clampInt($("#setCount").value, 1, 10, 5);
  $("#setCount").value = String(count);

  const include = validateNums(parseNums($("#includeNums").value), "고정(포함) 번호", { maxLen: 6 });
  const exclude = validateNums(parseNums($("#excludeNums").value), "제외 번호", { maxLen: 45 });

  const sets = [];
  const seen = new Set();

  // 너무 빡빡한 조건에서 무한 루프 방지
  const maxTry = 4000;
  let tries = 0;

  while (sets.length < count && tries < maxTry) {
    tries++;
    const s = pickSet({ include, exclude });
    const key = s.join("-");
    if (seen.has(key)) continue;
    seen.add(key);
    sets.push(s);
  }

  if (sets.length < count) {
    throw new Error("조건 때문에 충분한 세트를 만들지 못했어요. (포함/제외를 조금 줄여보세요)");
  }

  state.sets = sets;
  renderResults(state.sets);
  setStatus("생성 완료!", `${count}세트 · 시도 ${tries}회`);
  toast("말랑말랑 생성 완료!");
}

function saveCurrentToHistory() {
  if (!state.sets.length) {
    toast("저장할 결과가 없어요.");
    return;
  }
  const items = loadHistory();
  items.unshift({ at: nowStamp(), sets: state.sets });
  saveHistory(items);
  renderHistory(items);
  toast("히스토리에 저장했어요!");
}

function wireUp() {
  // +/- step
  document.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number.parseInt(btn.getAttribute("data-step") || "0", 10);
      const input = $("#setCount");
      input.value = String(clampInt(Number(input.value) + step, 1, 10, 5));
    });
  });

  $("#btnGenerate").addEventListener("click", () => {
    try {
      generate();
    } catch (e) {
      setStatus("생성 실패", "조건 확인");
      toast(e instanceof Error ? e.message : "생성 실패");
    }
  });

  $("#btnCopy").addEventListener("click", () => {
    copyAll();
  });

  $("#btnClear").addEventListener("click", () => {
    clearAll();
    toast("초기화!");
  });

  $("#btnSave").addEventListener("click", () => {
    saveCurrentToHistory();
  });

  $("#btnClearHistory").addEventListener("click", () => {
    saveHistory([]);
    renderHistory([]);
    toast("히스토리를 비웠어요.");
  });

  // Enter = generate
  ["#setCount", "#includeNums", "#excludeNums"].forEach((sel) => {
    $(sel).addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#btnGenerate").click();
    });
  });
}

function init() {
  wireUp();
  renderHistory(loadHistory());
  setStatus("준비됨", "—");
}

init();
