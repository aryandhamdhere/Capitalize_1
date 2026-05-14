"""
Single-call Gemini helper for dashboard narratives only.
"""

from __future__ import annotations

import json
import re
from typing import Any

import google.generativeai as genai

from ..config import settings


def _extract_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            return json.loads(m.group())
        raise


def generate_dashboard_narrative(facts_json: str) -> dict[str, Any]:
    """
    One Gemini API request. Returns { executive_summary, recommendations }.
    """
    if not settings.GEMINI_API_KEY:
        return {
            "executive_summary": None,
            "recommendations": [],
            "gemini_skipped": True,
        }

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    prompt = f"""You are a concise MSME financial analyst for an Indian business owner.

FACTS (JSON, authoritative — do not invent numbers):
{facts_json}

Return ONLY valid JSON with exactly this shape (no markdown fences):
{{
  "executive_summary": "2-3 sentences in plain English referencing the facts.",
  "recommendations": [
    "First actionable recommendation",
    "Second actionable recommendation",
    "Third actionable recommendation"
  ]
}}
Rules:
- Do not output any numbers that contradict the facts JSON.
- recommendations must be exactly 3 short strings.
"""

    generation_config = {
        "temperature": 0.35,
        "response_mime_type": "application/json",
    }
    response = model.generate_content(prompt, generation_config=generation_config)
    raw = response.text or "{}"
    data = _extract_json_object(raw)
    return {
        "executive_summary": data.get("executive_summary"),
        "recommendations": data.get("recommendations") or [],
        "gemini_skipped": False,
    }
