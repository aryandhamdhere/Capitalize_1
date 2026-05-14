from .llm_engine import llm
from .data_query_engine import run_data_query
from .finance_templates import TEMPLATES
from .query_router import route_query


class AnalyticsAgent:
    def __init__(self):
        pass

    def generate_sql(self, user_query: str) -> str:
        """Use template engine to generate SQL for the query."""
        prompt = f"""
        You are an AI financial data analyst. Convert the following natural language query
        into a clean SQL instruction that will be run on a table named 't'.

        Query: "{user_query}"

        Only output SQL, nothing else.
        """
        sql = llm.generate(prompt)
        return sql.strip()

    def run(self, query_text: str) -> dict:
        """
        Orchestrate the full query pipeline:
          1. Route query to correct engine (duckdb / faiss / hybrid)
          2. Generate SQL via template matching
          3. Execute via run_data_query with engine hint
          4. Return structured result (interface unchanged)
        """
        # Step 1: Determine execution engine
        engine = route_query(query_text)

        # Step 2: Generate SQL (always do this — needed for duckdb/hybrid)
        sql = self.generate_sql(query_text)

        # Step 3: Get template metadata for richer response
        meta = llm.generate_with_meta(query_text)

        # Step 4: Execute
        df = run_data_query(query_text, sql, engine=engine)

        # Step 5: Format output — preserve original contract
        if isinstance(df, list):
            output_data = [d.to_dict(orient="records") for d in df]
            rows_count = sum(len(d) for d in df)
        else:
            output_data = df.to_dict(orient="records")
            rows_count = len(df)

        return {
            "output": output_data,
            "metadata": {
                "sql_used":    sql,
                "rows":        rows_count,
                # New additive fields — won't break existing consumers
                "engine":      engine,
                "template_id": meta.get("template_id"),
                "category":    meta.get("category"),
                "insight_prefix": meta.get("insight_prefix"),
            },
        }


analytics_agent = AnalyticsAgent()
