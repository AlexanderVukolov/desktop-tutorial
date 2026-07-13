"""
Веб-сервер программы (Flask).

Открывает панель в браузере и отдаёт данные:
  /              — страница дашборда
  /api/summary   — сводка (итоги, воронки, этапы, помесячно) в формате JSON
  /api/deals     — список сделок
  /api/status    — режим работы (демо / реальный amoCRM) и проверка связи

Запуск: см. файл run.py в корне проекта.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

from .amocrm_client import AmoCRMClient, AmoCRMConfig, AmoCRMError, Deal, Pipeline
from .analytics import plan_fact_report, available_months
from . import demo_data

load_dotenv()


def _is_demo() -> bool:
    return os.getenv("DEMO_MODE", "1").strip() in ("1", "true", "yes", "on")


def _build_client() -> AmoCRMClient:
    subdomain = os.getenv("AMOCRM_SUBDOMAIN", "").strip()
    token = os.getenv("AMOCRM_ACCESS_TOKEN", "").strip()
    domain = os.getenv("AMOCRM_DOMAIN", "amocrm.ru").strip()
    if not subdomain or not token:
        raise AmoCRMError(
            "Не заданы AMOCRM_SUBDOMAIN и/или AMOCRM_ACCESS_TOKEN в файле .env."
        )
    return AmoCRMClient(AmoCRMConfig(subdomain, token, domain))


def _load_data(
    created_from: datetime | None,
    created_to: datetime | None,
) -> tuple[list[Deal], dict[int, Pipeline], dict[int, str]]:
    """Получить сделки, воронки и пользователей — из демо-набора или из amoCRM."""
    if _is_demo():
        deals = demo_data.DEMO_DEALS
        if created_from:
            deals = [d for d in deals if d.created_at and d.created_at >= created_from]
        if created_to:
            deals = [d for d in deals if d.created_at and d.created_at <= created_to]
        return deals, demo_data.DEMO_PIPELINES, demo_data.DEMO_USERS

    client = _build_client()
    pipelines = client.get_pipelines()
    users = client.get_users()
    deals = client.get_deals(created_from=created_from, created_to=created_to)
    return deals, pipelines, users


def _parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def create_app() -> Flask:
    app = Flask(__name__, template_folder="templates", static_folder="static")

    @app.route("/")
    def index():
        return render_template("index.html", demo=_is_demo())

    @app.route("/api/status")
    def api_status():
        if _is_demo():
            return jsonify({"mode": "demo", "connected": True, "account": "Демо-режим"})
        try:
            client = _build_client()
            account = client.ping()
            return jsonify(
                {
                    "mode": "amocrm",
                    "connected": True,
                    "account": account.get("name", "amoCRM"),
                }
            )
        except AmoCRMError as exc:
            return jsonify({"mode": "amocrm", "connected": False, "error": str(exc)})

    @app.route("/api/summary")
    def api_summary():
        created_from = _parse_date(request.args.get("from"))
        created_to = _parse_date(request.args.get("to"))
        month = request.args.get("month") or None
        try:
            deals, pipelines, users = _load_data(created_from, created_to)
        except AmoCRMError as exc:
            return jsonify({"error": str(exc)}), 502
        all_months = available_months(deals)
        if not month:
            month = all_months[0] if all_months else None
        # Факт считаем за выбранный месяц (как в отчёте «План-Факт»).
        month_deals = (
            [d for d in deals if d.created_at and d.created_at.strftime("%Y-%m") == month]
            if month
            else deals
        )
        report = plan_fact_report(month_deals, pipelines, users, period_month=month)
        # Динамику по месяцам показываем за весь период (для наглядности).
        from .analytics import _by_month  # локальный импорт, чтобы не менять API модуля
        report["by_month"] = _by_month(deals)
        report["available_months"] = all_months
        return jsonify(report)

    @app.route("/api/deals")
    def api_deals():
        created_from = _parse_date(request.args.get("from"))
        created_to = _parse_date(request.args.get("to"))
        pipeline_id = request.args.get("pipeline_id", type=int)
        try:
            deals, pipelines, users = _load_data(created_from, created_to)
        except AmoCRMError as exc:
            return jsonify({"error": str(exc)}), 502

        if pipeline_id:
            deals = [d for d in deals if d.pipeline_id == pipeline_id]

        rows = []
        for d in deals:
            pipeline = pipelines.get(d.pipeline_id)
            manager = d.custom.get("Менеджер") or users.get(d.responsible_user_id, "")
            rows.append(
                {
                    "id": d.id,
                    "name": d.name,
                    "price": d.price,
                    "pipeline": pipeline.name if pipeline else "—",
                    "status": (
                        pipeline.statuses.get(d.status_id, "—") if pipeline else "—"
                    ),
                    "is_won": d.is_won,
                    "is_lost": d.is_lost,
                    "created_at": d.created_at.strftime("%d.%m.%Y") if d.created_at else "",
                    "manager": manager,
                }
            )
        rows.sort(key=lambda r: r["price"], reverse=True)
        return jsonify({"deals": rows, "count": len(rows)})

    return app
