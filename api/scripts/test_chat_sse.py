"""POST /chat SSE smoke test. Writes UTF-8 JSON lines with --out.

Usage (from repo `api/`):
  ..\\venv\\Scripts\\python scripts\\test_chat_sse.py
  ..\\venv\\Scripts\\python scripts\\test_chat_sse.py --base http://127.0.0.1:8001 --out results.jsonl
"""
from __future__ import annotations

import argparse
import json
import urllib.request


def parse_sse(body: str) -> tuple[list[dict], str, list[str]]:
    sources: list | None = None
    deltas: list[str] = []
    errors: list[str] = []
    current_event = ""

    for line in body.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("event:"):
            current_event = line[6:].strip()
            continue
        if line.startswith("data:"):
            raw = line[5:].strip()
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if current_event == "sources" and "sources" in payload:
                sources = payload["sources"]
            elif current_event == "delta" and "text" in payload:
                deltas.append(payload["text"])
            elif current_event == "error" and "message" in payload:
                errors.append(str(payload["message"]))

    return (sources or [], "".join(deltas), errors)


def chat_once(base: str, message: str, timeout: float = 120.0) -> dict:
    url = f"{base.rstrip('/')}/chat"
    req = urllib.request.Request(
        url,
        data=json.dumps({"message": message}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read().decode("utf-8", errors="replace")

    sources, answer, errors = parse_sse(raw)
    return {
        "message": message,
        "answer_len": len(answer),
        "answer_preview": answer[:500] + ("..." if len(answer) > 500 else ""),
        "sources_count": len(sources),
        "first_source_file": sources[0].get("file") if sources else None,
        "errors": errors,
        "ok": len(answer) > 0 and not errors,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--base", default="http://127.0.0.1:8001")
    p.add_argument("--out", default="", help="Append JSON lines (UTF-8)")
    args = p.parse_args()
    tests = [
        "zdravo",
        "Ko si ti ukratko?",
        "Navedi jedan Netlify demo iz projekata.",
    ]

    out_fp = open(args.out, "a", encoding="utf-8") if args.out else None
    try:
        for msg in tests:
            try:
                row = chat_once(args.base, msg)
            except Exception as e:
                row = {"message": msg, "ok": False, "errors": [str(e)]}
            line = json.dumps(row, ensure_ascii=True)
            print(line)
            print("---")
            if out_fp:
                out_fp.write(json.dumps(row, ensure_ascii=False) + "\n")
                out_fp.flush()
    finally:
        if out_fp:
            out_fp.close()


if __name__ == "__main__":
    main()
