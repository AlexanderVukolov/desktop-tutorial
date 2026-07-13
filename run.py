"""
Запуск программы.

  python run.py

После запуска откройте в браузере адрес, который покажется в консоли
(обычно http://127.0.0.1:5000).
"""

import os
import webbrowser
from threading import Timer

from dotenv import load_dotenv

from app.server import create_app

load_dotenv()


def _open_browser(url: str) -> None:
    try:
        webbrowser.open(url)
    except Exception:
        pass  # если браузер не открылся сам — просто откройте адрес вручную


def main() -> None:
    port = int(os.getenv("PORT", "5000"))
    url = f"http://127.0.0.1:{port}"
    app = create_app()

    print("=" * 60)
    print("  Панель финансовой аналитики amoCRM запущена")
    print(f"  Откройте в браузере:  {url}")
    demo = os.getenv("DEMO_MODE", "1").strip() in ("1", "true", "yes", "on")
    print(f"  Режим: {'ДЕМО (тестовые данные)' if demo else 'amoCRM (реальные данные)'}")
    print("  Остановить: нажмите Ctrl+C")
    print("=" * 60)

    # Автоматически открыть браузер через секунду после старта.
    Timer(1.0, _open_browser, args=[url]).start()

    app.run(host="127.0.0.1", port=port, debug=False)


if __name__ == "__main__":
    main()
