import axios from "axios";

const BASE = "http://localhost:8000/api";

export async function askQuery(query) {
  const res = await axios.post(`${BASE}/query`, {
    query: query,
    user: "demo_user"
  });

  return res.data;
}
