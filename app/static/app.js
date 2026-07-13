"use strict";

// ---------- Форматирование ----------
const fmtMoney = (v) =>
  (Number(v) || 0).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
const fmtNum = (v) => (Number(v) || 0).toLocaleString("ru-RU");
const fmtPct = (v) => (Number(v) || 0).toLocaleString("ru-RU") + " %";
const shortMoney = (v) => {
  v = Number(v) || 0;
  if (v >= 1e6) return (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + " млн";
  if (v >= 1e3) return Math.round(v / 1e3) + "к";
  return String(v);
};
const monthName = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const n = ["", "янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${n[Number(m)]} ${y}`;
};

const $ = (id) => document.getElementById(id);
const showError = (m) => { const e = $("error"); e.textContent = "⚠ " + m; e.classList.remove("hidden"); };
const clearError = () => $("error").classList.add("hidden");

let PROJECTS = []; // текущие проекты (для формы планов)

// ---------- Статус подключения ----------
async function loadStatus() {
  try {
    const d = await (await fetch("/api/status")).json();
    const b = $("status-badge");
    if (d.mode === "demo") { b.textContent = "Демо-режим"; b.className = "badge badge--demo"; }
    else if (d.connected) { b.textContent = "amoCRM · " + (d.account || "подключён"); b.className = "badge badge--ok"; }
    else { b.textContent = "нет связи с amoCRM"; b.className = "badge badge--err"; showError(d.error || ""); }
  } catch (e) { $("status-badge").textContent = "—"; }
}

// ---------- Герой ----------
function renderHero(total, plan, completion, period) {
  $("hero-month").textContent = "· " + monthName(period);
  $("hero-cash").textContent = fmtMoney(total.cash);
  const pct = completion.revenue;
  const fill = $("hero-fill");
  fill.style.width = Math.min(pct, 100) + "%";
  fill.classList.toggle("ok", pct >= 100);
  const pctEl = $("hero-pct");
  pctEl.textContent = fmtPct(pct);
  pctEl.classList.toggle("ok", pct >= 100);
  $("hero-plan").textContent = fmtMoney(plan.revenue);

  $("hero-side").innerHTML = `
    <div class="row"><span>Выручка в воронке</span><b>${fmtMoney(total.revenue)}</b></div>
    <div class="row"><span>Рассрочка</span><b>${fmtMoney(total.installment)}</b></div>
    <div class="row"><span>Предоплата</span><b>${fmtMoney(total.prepayment)}</b></div>
    <div class="row"><span>Средний чек</span><b>${fmtMoney(total.avg_check)}</b></div>`;
}

// ---------- Стат-плитки ----------
function renderTiles(total, plan) {
  const tiles = [
    { label: "Лиды", value: fmtNum(total.leads), sub: `план ${fmtNum(plan.leads)}` },
    { label: "Квал-лиды", value: fmtNum(total.qualified), sub: total.leads ? Math.round(total.qualified / total.leads * 100) + " % от лидов" : "" },
    { label: "Продажи, шт", value: fmtNum(total.sales), sub: `план ${fmtNum(plan.sales)}` },
    { label: "Конверсия в продажу", value: fmtPct(total.conversion), sub: "лид → продажа" },
    { label: "Средний чек", value: fmtMoney(total.avg_check), sub: "" },
  ];
  $("tiles").innerHTML = tiles.map((t) => `
    <div class="tile">
      <div class="tile__label">${t.label}</div>
      <div class="tile__value">${t.value}</div>
      <div class="tile__sub">${t.sub}</div>
    </div>`).join("");
}

// ---------- План/факт метрики ----------
function meterRow(label, fact, plan, pct, money) {
  const f = money ? fmtMoney(fact) : fmtNum(fact);
  const p = money ? fmtMoney(plan) : fmtNum(plan);
  const done = pct >= 100;
  return `
    <div class="mrow">
      <div class="mrow__label">${label}</div>
      <div class="mrow__bar">
        <div class="nums"><b>${f}</b><span class="muted">план ${p}</span></div>
        <div class="meter"><div class="meter__fill ${done ? "ok" : ""}" style="width:${Math.min(pct, 100)}%"></div></div>
      </div>
      <div class="mrow__pct ${done ? "ok" : ""}">${fmtPct(pct)}</div>
    </div>`;
}
function renderPlanFact(total, plan, completion) {
  $("planfact").innerHTML =
    meterRow("Лиды", total.leads, plan.leads, completion.leads, false) +
    meterRow("Продажи, шт", total.sales, plan.sales, completion.sales, false) +
    meterRow("Выручка (в кассу)", total.cash, plan.revenue, completion.revenue, true);
}

// ---------- График по месяцам ----------
function renderChart(months) {
  const max = Math.max(1, ...months.map((m) => m.cash));
  const el = $("chart");
  el.innerHTML = months.map((m) => {
    const h = Math.max(4, Math.round((m.cash / max) * 150));
    return `
    <div class="cbar">
      <div class="cbar__val">${shortMoney(m.cash)}</div>
      <div class="cbar__mark" style="height:${h}px"
           data-month="${monthName(m.month)}" data-cash="${fmtMoney(m.cash)}"
           data-leads="${fmtNum(m.leads)}" data-sales="${fmtNum(m.sales)}"></div>
      <div class="cbar__label">${monthName(m.month)}</div>
    </div>`;
  }).join("") || '<p class="muted">нет данных</p>';

  // Подсказки при наведении.
  const tip = $("tooltip");
  el.querySelectorAll(".cbar__mark").forEach((mark) => {
    mark.addEventListener("mousemove", (e) => {
      tip.innerHTML = `<b>${mark.dataset.month}</b><br>Деньги в кассу: <b>${mark.dataset.cash}</b><br>Лиды: <b>${mark.dataset.leads}</b> · Продажи: <b>${mark.dataset.sales}</b>`;
      tip.classList.remove("hidden");
      tip.style.left = Math.min(e.clientX + 14, window.innerWidth - tip.offsetWidth - 10) + "px";
      tip.style.top = e.clientY + 14 + "px";
    });
    mark.addEventListener("mouseleave", () => tip.classList.add("hidden"));
  });
}

// ---------- Форма планов ----------
async function loadPlans(month) {
  try {
    const d = await (await fetch("/api/plans?month=" + encodeURIComponent(month))).json();
    PROJECTS = d.plans;
    $("plans-month").textContent = monthName(month);
    $("plans-body").innerHTML = d.plans.map((p, i) => `
      <tr data-project="${p.project}">
        <td>${p.project}</td>
        <td><input type="number" min="0" step="1" class="p-leads" value="${p.leads || 0}"></td>
        <td><input type="number" min="0" step="1" class="p-sales" value="${p.sales || 0}"></td>
        <td><input type="number" min="0" step="1000" class="p-rev" value="${p.revenue || 0}"></td>
      </tr>`).join("");
    updatePlansFoot();
    $("plans-body").querySelectorAll("input").forEach((inp) =>
      inp.addEventListener("input", updatePlansFoot));
  } catch (e) { /* тихо */ }
}
function updatePlansFoot() {
  let l = 0, s = 0, r = 0;
  $("plans-body").querySelectorAll("tr").forEach((tr) => {
    l += Number(tr.querySelector(".p-leads").value) || 0;
    s += Number(tr.querySelector(".p-sales").value) || 0;
    r += Number(tr.querySelector(".p-rev").value) || 0;
  });
  $("plans-foot").innerHTML = `<tr><td>Итого</td><td>${fmtNum(l)}</td><td>${fmtNum(s)}</td><td>${fmtMoney(r)}</td></tr>`;
}
async function savePlans() {
  const month = $("month").value;
  const rows = [...$("plans-body").querySelectorAll("tr")];
  $("plans-msg").textContent = "Сохранение…";
  try {
    for (const tr of rows) {
      await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: tr.dataset.project,
          month,
          leads: Number(tr.querySelector(".p-leads").value) || 0,
          sales: Number(tr.querySelector(".p-sales").value) || 0,
          revenue: Number(tr.querySelector(".p-rev").value) || 0,
        }),
      });
    }
    $("plans-msg").textContent = "✓ Планы сохранены";
    loadReport(); // пересчитать план/факт с новыми планами
    setTimeout(() => ($("plans-msg").textContent = ""), 2500);
  } catch (e) {
    $("plans-msg").textContent = "Ошибка сохранения";
  }
}

// ---------- Загрузка отчёта ----------
async function loadReport() {
  clearError();
  try {
    const month = $("month").value;
    const q = month ? "?month=" + encodeURIComponent(month) : "";
    const d = await (await fetch("/api/summary" + q)).json();
    if (d.error) { showError(d.error); return; }

    const sel = $("month");
    if (!sel.dataset.filled && d.available_months) {
      sel.innerHTML = d.available_months.map((m) => `<option value="${m}">${monthName(m)}</option>`).join("");
      if (d.period) sel.value = d.period;
      sel.dataset.filled = "1";
      loadPlans(sel.value);
    }
    renderHero(d.total, d.total_plan, d.total_completion, d.period);
    renderTiles(d.total, d.total_plan);
    renderPlanFact(d.total, d.total_plan, d.total_completion);
    renderChart(d.by_month);
  } catch (e) {
    showError("Не удалось загрузить данные: " + e.message);
  }
}

// ---------- Старт ----------
$("refresh").addEventListener("click", loadReport);
$("month").addEventListener("change", () => { loadReport(); loadPlans($("month").value); });
$("plans-save").addEventListener("click", savePlans);

loadStatus();
loadReport();
