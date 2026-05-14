"""
llm_engine.py — Scored template matching engine for NL → SQL conversion.

Replaces the 3-line hardcoded keyword hack with a proper scoring system
across all 30 MSME-specific finance templates.

Interface unchanged: llm.generate(prompt) → str (SQL)
New:                  llm.generate_with_meta(prompt) → dict
"""

from .finance_templates import TEMPLATES, TEMPLATE_MAP

# Hindi transliteration normalization map
# Maps common Hindi Romanized words → English equivalents for matching
_HINDI_MAP = {
    "paisa":       "cash",
    "kamai":       "revenue",
    "kharch":      "expense",
    "kitna":       "how much",
    "kitne":       "how many",
    "bacha":       "remaining",
    "ghata":       "loss",
    "faida":       "profit",
    "sab":         "all",
    "batao":       "show",
    "mahine":      "month",
    "mahina":      "month",
    "hafte":       "week",
    "saal":        "year",
    "baaki":       "pending",
    "diya":        "paid",
    "gaya":        "went",
    "raha":        "trend",
    "bada":        "large",
    "bure":        "worst",
    "accha":       "best",
    "zyada":       "high",
    "kam":         "low",
    "pichhle":     "last",
    "pichle":      "last",
    "achanak":     "unusual",
    "koi":         "any",
    "kaise":       "how",
    "kab":         "when",
}


def _normalize(text: str) -> str:
    """Lowercase, apply Hindi transliteration substitutions."""
    text = text.lower()
    for hindi, english in _HINDI_MAP.items():
        text = text.replace(hindi, english)
    return text


def _score_template(query_norm: str, template: dict) -> int:
    """
    Score a template against a normalised query.

    Scoring rules:
    - Multi-word trigger phrase match (e.g. "cash flow"): +2
    - Single-word trigger match: +1
    - Returns total score (higher = better match)
    """
    score = 0
    for trigger in template["triggers"]:
        t = trigger.lower()
        if t in query_norm:
            # Reward longer phrase matches more
            score += len(t.split())
    return score


class LocalLLMEngine:
    def __init__(self, model_id="template_engine"):
        print(">>> Capitalize LLM Engine loaded:", model_id)
        self.model_id = model_id
        self._fallback_id = "full_financial_summary"

    def generate_with_meta(self, prompt: str) -> dict:
        """
        Match query to best template. Returns SQL + match metadata.

        Returns:
            {
                "sql": str,
                "template_id": str,
                "category": str,
                "score": int,
                "result_format": str,
                "insight_prefix": str,
            }
        """
        query_norm = _normalize(prompt)

        # Score all templates
        scored = [
            (t, _score_template(query_norm, t))
            for t in TEMPLATES
        ]

        # Sort by score descending, stable (preserves template order on ties)
        scored.sort(key=lambda x: x[1], reverse=True)

        best_template, best_score = scored[0]

        # Fall back to summary if nothing matched
        if best_score < 1:
            best_template = TEMPLATE_MAP[self._fallback_id]
            best_score = 0

        sql = best_template["sql_template"].replace("{table}", "t")

        return {
            "sql":            sql,
            "template_id":    best_template["id"],
            "category":       best_template["category"],
            "score":          best_score,
            "result_format":  best_template["result_format"],
            "insight_prefix": best_template["insight_prefix"],
        }

    def generate(self, prompt: str) -> str:
        """
        Drop-in replacement for old generate().
        Returns SQL string. Interface unchanged — agent.py is unaffected.
        """
        return self.generate_with_meta(prompt)["sql"]


llm = LocalLLMEngine()
