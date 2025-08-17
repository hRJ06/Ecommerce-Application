import axios from "axios";

const baseURL = typeof window !== "undefined"
  ? `${window.location.origin}/api`
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api");

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("token=")
  );
  return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1].trim()) : null;
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const fetchData = {
  get: async (url: string, params = {}) => {
    try {
      const token = getTokenFromCookie();
      const config = {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };
      console.log("MAKING GET REQUEST WITH CONFIG - ", { url, config });
      return await axiosInstance.get(url, config);
    } catch (error) {
      console.error("ERROR FETCHING DATA - ", error);
      throw error;
    }
  },
  post: async (url: string, data = {}) => {
    try {
      const token = getTokenFromCookie();
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };
      console.log("MAKING POST REQUEST WITH CONFIG - ", { url, data, config });
      return await axiosInstance.post(url, data, config);
    } catch (error) {
      console.error("ERROR POSTING DATA - ", error);
      throw error;
    }
  },
};

export default fetchData;
