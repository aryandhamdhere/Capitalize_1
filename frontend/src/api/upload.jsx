import axios from "axios";

const BASE = "http://localhost:8000/api";

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post(`${BASE}/upload/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}
