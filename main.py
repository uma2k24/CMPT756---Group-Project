from __future__ import annotations

import argparse

import uvicorn

from app.gateway import create_gateway_app
from app.processor import create_processor_app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Starter code for Pacco experiment."
    )
    parser.add_argument(
        "--service",
        choices=["gateway", "processor"],
        default="gateway",
        help="Which service to run.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind host.")
    parser.add_argument("--port", type=int, default=8000, help="Bind port.")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app = create_gateway_app() if args.service == "gateway" else create_processor_app()
    uvicorn.run(app, host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    main()
