import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5024/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sacrm_access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
