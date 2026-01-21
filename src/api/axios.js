import axios from "axios";

{/*this is for local run */}
{/* 
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});
*/}

{/*This is for cloudflare pages run*/}
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api/",
});

{/*change for here */}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;
