"use strict";

// ---- Форматирование ----
const fmtMoney = (v) =>
  (Number(v) || 0).toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
const fmtNum = (v) => (Number(v) || 0).toLocaleString("ru-RU");
const fmtPct = (v) => (Number(v) || 0).toLocaleString("ru-RU") + " %";
const monthName = (ym) => {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const names = ["", "янв", "фев", "мар", "апр", "май", "июн",
                 "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${names[Number(m)]} ${y}`;
};

const $ = (id) => document.getElementById(id);
const showError = (msg) => {
  const el = $("error");
  el.textContent = "⚠ " + msg;
  el.classList.remove("hidden");
};
const clearError = () => $("error").classList.add("hidden");
const setLoading = (on) => $("loader").classList.toggle("hidden", !on);

// ---- Статус подключения ----
async function loadStatus() {
  try {
    const r = await fetch("/api/status");
    const d = await r.json();
    const badge = $("status-badge");
    if (d.mode === "demo") {
      badge.textContent = "Демо-режим (тестовые данные)";
      badge.className = "badge badge--demo";
    } else if (d.connected) {
      badge.textContent = "amoCRM подключён · " + (d.account || "");
      badge.className = "badge badge--ok";
    } else {
      badge.textContent = "amoCRM: нет связи";
      badge.className = "badge badge--err";
      showError(d.error || "Не удалось подключиться к amoCRM");
    }
  } catch (e) {
    $("status-badge").textContent = "ошибка";
  }
}

// ---- Карточки итогов ----
function renderCards(total) {
  const cards = [
    { label: "Лиды", value: fmtNum(total.leads), sub: `квал: ${fmtNum(total.qualified)}` , cls: "card--brand"},
    { label: "Продажи, шт", value: fmtNum(total.sales), sub: `конверсия ${fmtPct(total.conversion)}` },
    { label: "Деньги в кассу", value: fmtMoney(total.cash), sub: "фактически получено", cls: "card--green" },
    { label: "Выручка в воронке", value: fmtMoney(total.revenue), sub: "по выигранным сделкам" },
    { label: "Средний чек", value: fmtMoney(total.avg_check), sub: "" },
    { label: "Рассрочка", value: fmtMoney(total.installment), sub: "" },
    { label: "Предоплата", value: fmtMoney(total.prepayment), sub: "" },
  ];
  $("cards").innerHTML = cards
    .map(
      (c) => `
      <div class="card ${c.cls || ""}">
        <div class="card__label">${c.label}</div>
        <div class="card__value">${c.value}</div>
        <div class="card__sub">${c.sub}</div>
      </div>`
    )
    .join("");
}

// ---- Сводная по двум проектам ----
function renderSummary(total, plan, completion) {
  $("summary").innerHTML = `
    <div class="project__head">
      <h3>Итого по проектам</h3>
      <span class="muted">чек ${fmtMoney(total.avg_check)} · конверсия ${fmtPct(total.conversion)}</span>
    </div>
    ${planRow("Лиды", total.leads, plan.leads, completion.leads, false)}
    ${planRow("Продажи, шт", total.sales, plan.sales, completion.sales, false)}
    ${planRow("Выручка (деньги в кассу)", total.cash, plan.revenue, completion.revenue, true)}
    <div class="project__extra">
      <span>Квал-лиды: <b>${fmtNum(total.qualified)}</b></span>
      <span>Выручка в воронке: <b>${fmtMoney(total.revenue)}</b></span>
      <span>Рассрочка: <b>${fmtMoney(total.installment)}</b></span>
      <span>Предоплата: <b>${fmtMoney(total.prepayment)}</b></span>
    </div>`;
}

// ---- Проекты: план/факт ----
function planRow(label, fact, plan, pct, isMoney) {
  const f = isMoney ? fmtMoney(fact) : fmtNum(fact);
  const p = isMoney ? fmtMoney(plan) : fmtNum(plan);
  const width = Math.min(Number(pct) || 0, 100);
  const done = (Number(pct) || 0) >= 100;
  return `
    <div class="pf-row">
      <div class="pf-row__label">${label}</div>
      <div class="pf-row__nums"><b>${f}</b> <span class="muted">/ план ${p}</span></div>
      <div class="pf-bar"><div class="pf-bar__fill ${done ? "pf-bar__fill--done" : ""}" style="width:${width}%"></div></div>
      <div class="pf-row__pct ${done ? "ok" : ""}">${fmtPct(pct)}</div>
    </div>`;
}

function renderProjects(projects) {
  if (!projects.length) {
    $("projects").innerHTML = '<p class="muted">Нет проектов в настройке (app/mapping.py)</p>';
    return;
  }
  $("projects").innerHTML = projects
    .map((p) => {
      const f = p.fact;
      return `
      <div class="project">
        <div class="project__head">
          <h3>${p.name}</h3>
          <span class="muted">чек ${fmtMoney(f.avg_check)} · конверсия ${fmtPct(f.conversion)}</span>
        </div>
        ${planRow("Лиды", f.leads, p.plan.leads, p.completion.leads, false)}
        ${planRow("Продажи, шт", f.sales, p.plan.sales, p.completion.sales, false)}
        ${planRow("Деньги в кассу", f.cash, p.plan.revenue, p.completion.revenue, true)}
        <div class="project__extra">
          <span>Квал-лиды: <b>${fmtNum(f.qualified)}</b></span>
          <span>Рассрочка: <b>${fmtMoney(f.installment)}</b></span>
          <span>Предоплата: <b>${fmtMoney(f.prepayment)}</b></span>
        </div>
      </div>`;
    })
    .join("");
}

// ---- Менеджеры (сводно по всем проектам) ----
function renderManagers(projects) {
  const map = new Map();
  projects.forEach((p) =>
    (p.by_manager || []).forEach((m) => {
      const cur = map.get(m.manager) || { leads: 0, qualified: 0, sales: 0, cash: 0 };
      cur.leads += m.leads; cur.qualified += m.qualified;
      cur.sales += m.sales; cur.cash += m.cash;
      map.set(m.manager, cur);
    })
  );
  const rows = [...map.entries()].sort((a, b) => b[1].cash - a[1].cash);
  $("managers").querySelector("tbody").innerHTML =
    rows
      .map(
        ([name, m]) => `
      <tr><td>${name}</td><td>${fmtNum(m.leads)}</td><td>${fmtNum(m.qualified)}</td>
      <td>${fmtNum(m.sales)}</td><td class="right">${fmtMoney(m.cash)}</td></tr>`
      )
      .join("") || `<tr><td colspan="5" class="muted">нет данных</td></tr>`;
}

// ---- Источники ----
function renderSources(sources) {
  $("sources").querySelector("tbody").innerHTML =
    (sources || [])
      .map(
        (s) => `
      <tr><td>${s.source}</td><td>${fmtNum(s.leads)}</td>
      <td>${fmtNum(s.sales)}</td><td class="right">${fmtMoney(s.cash)}</td></tr>`
      )
      .join("") || `<tr><td colspan="4" class="muted">нет данных</td></tr>`;
}

// ---- Динамика по месяцам ----
function renderMonths(months) {
  const max = Math.max(1, ...months.map((m) => m.cash));
  $("months").innerHTML =
    months
      .map((m) => {
        const h = Math.round((m.cash / max) * 160);
        return `
        <div class="month-col">
          <div class="month-val">${(m.cash / 1000).toFixed(0)}к</div>
          <div class="month-bar" style="height:${h}px"></div>
          <div class="month-label">${monthName(m.month)}</div>
        </div>`;
      })
      .join("") || '<p class="muted">нет данных</p>';
}

// ---- Сделки ----
async function loadDeals() {
  try {
    const r = await fetch("/api/deals");
    const d = await r.json();
    if (d.error) return;
    $("deals-count").textContent = `(${d.count})`;
    const tag = (row) =>
      row.is_won
        ? '<span class="tag tag--won">оплачено</span>'
        : row.is_lost
        ? '<span class="tag tag--lost">отказ</span>'
        : '<span class="tag tag--progress">в работе</span>';
    $("deals").querySelector("tbody").innerHTML = d.deals
      .map(
        (row) => `
      <tr>
        <td>${row.name}</td><td>${row.pipeline}</td>
        <td>${row.status} ${tag(row)}</td>
        <td>${row.manager || "—"}</td><td>${row.created_at}</td>
        <td class="right">${fmtMoney(row.price)}</td>
      </tr>`
      )
      .join("");
  } catch (e) {
    /* тихо */
  }
}

// ---- Загрузка отчёта ----
async function loadReport() {
  clearError();
  setLoading(true);
  try {
    const month = $("month").value;
    const q = month ? `?month=${encodeURIComponent(month)}` : "";
    const r = await fetch("/api/summary" + q);
    const d = await r.json();
    if (d.error) {
      showError(d.error);
      return;
    }
    // Заполнить список месяцев один раз.
    const sel = $("month");
    if (!sel.dataset.filled && d.available_months) {
      sel.innerHTML = d.available_months
        .map((m) => `<option value="${m}">${monthName(m)}</option>`)
        .join("");
      if (d.period) sel.value = d.period;
      sel.dataset.filled = "1";
    }
    renderCards(d.total);
    renderSummary(d.total, d.total_plan, d.total_completion);
    renderProjects(d.projects);
    renderManagers(d.projects);
    renderSources(d.by_source);
    renderMonths(d.by_month);
  } catch (e) {
    showError("Не удалось загрузить данные: " + e.message);
  } finally {
    setLoading(false);
  }
}

// ---- Старт ----
$("refresh").addEventListener("click", () => {
  loadReport();
  loadDeals();
});
$("month").addEventListener("change", loadReport);

loadStatus();
loadReport();
loadDeals();
