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

function clampNumber(n, min, max, fallback) {
  const x = Number.parseFloat(String(n));
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
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

function setStatus(text, meta) {
  $("#status").textContent = text;
  $("#metaText").textContent = meta || "—";
}

const FEEDING_GUIDE = [
  {
    key: "0-0",
    label: "0개월(출생~4주)",
    months: [0, 0],
    milk: { perDayMl: "약 300~700ml/일", feedsPerDay: "8~12회/일", perFeedMl: "약 30~90ml/회" },
    solids: { stage: "해당 없음", mealsPerDay: "—", amount: "—" },
    notes: ["초기엔 소량·자주 먹는 경우가 많아요.", "소변/대변, 수면, 체중 증가를 함께 봐요."],
  },
  {
    key: "1-1",
    label: "1개월",
    months: [1, 1],
    milk: { perDayMl: "약 500~900ml/일", feedsPerDay: "7~10회/일", perFeedMl: "약 60~120ml/회" },
    solids: { stage: "해당 없음", mealsPerDay: "—", amount: "—" },
    notes: ["수유 간격이 조금씩 늘 수 있어요."],
  },
  {
    key: "2-2",
    label: "2개월",
    months: [2, 2],
    milk: { perDayMl: "약 600~1000ml/일", feedsPerDay: "6~8회/일", perFeedMl: "약 90~150ml/회" },
    solids: { stage: "해당 없음", mealsPerDay: "—", amount: "—" },
    notes: ["분유는 제품 라벨(농도/희석)을 꼭 지켜요."],
  },
  {
    key: "3-3",
    label: "3개월",
    months: [3, 3],
    milk: { perDayMl: "약 700~1000ml/일", feedsPerDay: "5~7회/일", perFeedMl: "약 120~180ml/회" },
    solids: { stage: "해당 없음", mealsPerDay: "—", amount: "—" },
    notes: ["수유량은 성장속도에 따라 들쭉날쭉할 수 있어요."],
  },
  {
    key: "4-5",
    label: "4~5개월",
    months: [4, 5],
    milk: { perDayMl: "약 700~1000ml/일", feedsPerDay: "4~6회/일", perFeedMl: "약 150~210ml/회" },
    solids: { stage: "이유식 시작(선택)", mealsPerDay: "0~1회/일", amount: "1~3작은술 → 30~60g 정도로 천천히" },
    notes: ["준비도(목 가누기, 음식 관심, 혀 내밀기 감소)가 되면 소량부터 시작해요."],
  },
  {
    key: "6-7",
    label: "6~7개월",
    months: [6, 7],
    milk: { perDayMl: "약 600~900ml/일", feedsPerDay: "3~5회/일", perFeedMl: "약 180~240ml/회" },
    solids: { stage: "초기 이유식", mealsPerDay: "1~2회/일", amount: "한 끼 50~100g 내외(아기 반응에 따라)" },
    notes: ["이유식이 늘면 분유량이 약간 줄 수 있어요."],
  },
  {
    key: "8-9",
    label: "8~9개월",
    months: [8, 9],
    milk: { perDayMl: "약 500~800ml/일", feedsPerDay: "3~4회/일", perFeedMl: "약 180~240ml/회" },
    solids: { stage: "중기 이유식", mealsPerDay: "2~3회/일", amount: "한 끼 80~150g 내외" },
    notes: ["손에 쥐는 음식(핑거푸드)은 질식 위험 음식은 피하고 작게 제공해요."],
  },
  {
    key: "10-11",
    label: "10~11개월",
    months: [10, 11],
    milk: { perDayMl: "약 400~700ml/일", feedsPerDay: "2~4회/일", perFeedMl: "약 180~240ml/회" },
    solids: { stage: "후기 이유식", mealsPerDay: "3회/일", amount: "한 끼 100~180g 내외" },
    notes: ["간식은 과자/주스보단 과일·요거트(무가당) 등으로 가볍게."],
  },
  {
    key: "12-15",
    label: "12~15개월",
    months: [12, 15],
    milk: { perDayMl: "우유/분유 합 400~600ml/일(참고)", feedsPerDay: "2~3회/일", perFeedMl: "약 200ml 전후" },
    solids: { stage: "유아식 전환기", mealsPerDay: "3회 + 간식 1~2회", amount: "한 끼 150~250g 내외(개인차 큼)" },
    notes: ["12개월 이후부터 일반 우유를 고려하는 경우가 많지만, 개별 상황에 따라 달라요."],
  },
  {
    key: "16-24",
    label: "16~24개월",
    months: [16, 24],
    milk: { perDayMl: "우유/분유 합 300~500ml/일(참고)", feedsPerDay: "1~2회/일", perFeedMl: "약 200ml 전후" },
    solids: { stage: "유아식", mealsPerDay: "3회 + 간식 1~2회", amount: "한 끼 200~300g 내외(개인차 큼)" },
    notes: ["식사 패턴(밥/국/반찬)은 가정 식단에 맞춰 점진적으로 적응해요."],
  },
];

function formatMlKgPerDayRangeForMonths(months) {
  // 참고용 범위(체중 입력 시 보여줄 추정치). 개별 사정/의료지침이 우선입니다.
  if (months <= 5) return { min: 120, max: 150, label: "0~5개월(참고)" };
  if (months <= 11) return { min: 90, max: 120, label: "6~11개월(참고)" };
  return { min: 60, max: 90, label: "12~24개월(참고)" };
}

function pickGuide(months) {
  const m = clampInt(months, 0, 24, 6);
  const hit = FEEDING_GUIDE.find((g) => m >= g.months[0] && m <= g.months[1]);
  return hit || FEEDING_GUIDE[FEEDING_GUIDE.length - 1];
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function renderResults({ months, weightKg, memo }) {
  const guide = pickGuide(months);
  const wrap = $("#results");
  wrap.innerHTML = "";

  const header = el("div", "resultHeader");
  header.appendChild(el("div", "resultTitle", `${months}개월 기준`));
  header.appendChild(el("div", "resultSub", `${guide.label} · 업데이트 ${nowStamp()}`));
  wrap.appendChild(header);

  const grid = el("div", "resultGrid");
  grid.appendChild(
    pill("분유/우유(하루)", guide.milk.perDayMl, "개인차가 커요")
  );
  grid.appendChild(pill("수유 횟수", guide.milk.feedsPerDay, "참고 범위"));
  grid.appendChild(pill("1회 수유량", guide.milk.perFeedMl, "참고 범위"));
  grid.appendChild(pill("이유식 단계", guide.solids.stage, "준비도 우선"));
  grid.appendChild(pill("이유식 횟수", guide.solids.mealsPerDay, "참고 범위"));
  grid.appendChild(pill("한 끼 양", guide.solids.amount, "참고 범위"));
  wrap.appendChild(grid);

  if (Number.isFinite(weightKg)) {
    const r = formatMlKgPerDayRangeForMonths(months);
    const minMl = Math.round(weightKg * r.min);
    const maxMl = Math.round(weightKg * r.max);
    const box = el("div", "noteBox");
    box.appendChild(el("div", "noteTitle", `체중 기준 분유/우유 추정치 (${r.label})`));
    box.appendChild(el("div", "noteText", `${weightKg.toFixed(1)}kg × ${r.min}~${r.max}ml/kg/일 ≈ ${minMl}~${maxMl}ml/일`));
    box.appendChild(el("div", "noteFine", "※ 질환/미숙아/성장 문제는 의료진 지침이 우선이에요."));
    wrap.appendChild(box);
  }

  if (memo && memo.trim()) {
    const m = el("div", "noteBox");
    m.appendChild(el("div", "noteTitle", "메모"));
    m.appendChild(el("div", "noteText", memo.trim()));
    wrap.appendChild(m);
  }

  const ul = el("ul", "noteList");
  guide.notes.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  const caution = el("div", "noteBox");
  caution.appendChild(el("div", "noteTitle", "참고 메모"));
  caution.appendChild(ul);
  wrap.appendChild(caution);
}

function pill(title, value, hint) {
  const p = el("div", "pill");
  p.appendChild(el("div", "pillTitle", title));
  p.appendChild(el("div", "pillValue", value));
  if (hint) p.appendChild(el("div", "pillHint", hint));
  return p;
}

function renderTable() {
  const wrap = $("#tableWrap");
  wrap.innerHTML = "";

  const table = el("div", "table");
  const head = el("div", "trow thead");
  ["개월", "분유/우유(하루)", "수유(회/일)", "이유식", "이유식(회/일)"].forEach((h) =>
    head.appendChild(el("div", "tcell", h))
  );
  table.appendChild(head);

  FEEDING_GUIDE.forEach((g) => {
    const row = el("div", "trow");
    row.appendChild(el("div", "tcell", g.label));
    row.appendChild(el("div", "tcell", g.milk.perDayMl));
    row.appendChild(el("div", "tcell", g.milk.feedsPerDay));
    row.appendChild(el("div", "tcell", g.solids.stage));
    row.appendChild(el("div", "tcell", g.solids.mealsPerDay));
    table.appendChild(row);
  });

  wrap.appendChild(table);
}

async function copyResultText() {
  const months = clampInt($("#ageMonths").value, 0, 24, 6);
  $("#ageMonths").value = String(months);
  const weightRaw = $("#weightKg").value;
  const weightKg = weightRaw ? clampNumber(weightRaw, 2, 20, NaN) : NaN;
  const memo = $("#memo").value || "";
  const guide = pickGuide(months);

  const lines = [];
  lines.push(`개월수: ${months}개월 (${guide.label})`);
  if (memo.trim()) lines.push(`메모: ${memo.trim()}`);
  lines.push(`분유/우유(하루): ${guide.milk.perDayMl}`);
  lines.push(`수유 횟수: ${guide.milk.feedsPerDay}`);
  lines.push(`1회 수유량: ${guide.milk.perFeedMl}`);
  lines.push(`이유식 단계: ${guide.solids.stage}`);
  lines.push(`이유식 횟수: ${guide.solids.mealsPerDay}`);
  lines.push(`이유식 한 끼 양: ${guide.solids.amount}`);

  if (Number.isFinite(weightKg)) {
    const r = formatMlKgPerDayRangeForMonths(months);
    const minMl = Math.round(weightKg * r.min);
    const maxMl = Math.round(weightKg * r.max);
    lines.push(`체중 추정치(${r.label}): ${weightKg.toFixed(1)}kg × ${r.min}~${r.max}ml/kg/일 ≈ ${minMl}~${maxMl}ml/일`);
  }

  lines.push("주의: 의료 조언이 아닌 참고 정보입니다. 아기 상태/의료진 지침을 우선하세요.");

  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    toast("결과 복사 완료!");
  } catch {
    toast("복사 실패(브라우저 권한 확인)");
  }
}

function clearAll() {
  $("#ageMonths").value = "6";
  $("#weightKg").value = "";
  $("#memo").value = "";
  $("#results").innerHTML = "";
  setStatus("초기화 완료!", "—");
}

function lookup() {
  const months = clampInt($("#ageMonths").value, 0, 24, 6);
  $("#ageMonths").value = String(months);
  const weightRaw = $("#weightKg").value;
  const weightKg = weightRaw ? clampNumber(weightRaw, 2, 20, NaN) : NaN;
  const memo = $("#memo").value || "";

  renderResults({ months, weightKg, memo });
  setStatus("조회 완료!", `${months}개월`);
}

function wireUp() {
  // +/- step
  document.querySelectorAll("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number.parseInt(btn.getAttribute("data-step") || "0", 10);
      const input = $("#ageMonths");
      input.value = String(clampInt(Number(input.value) + step, 0, 24, 6));
      lookup();
    });
  });

  $("#btnLookup").addEventListener("click", () => lookup());
  $("#btnCopy").addEventListener("click", () => copyResultText());

  $("#btnClear").addEventListener("click", () => {
    clearAll();
    toast("초기화!");
  });

  // Enter = generate
  ["#ageMonths", "#weightKg", "#memo"].forEach((sel) => {
    $(sel).addEventListener("keydown", (e) => {
      if (e.key === "Enter") $("#btnLookup").click();
    });
  });

  // 입력 변화 시 자동 조회
  ["#ageMonths", "#weightKg"].forEach((sel) => {
    $(sel).addEventListener("input", () => lookup());
  });
}

function init() {
  wireUp();
  renderTable();
  lookup();
  setStatus("준비됨", "—");
}

init();
