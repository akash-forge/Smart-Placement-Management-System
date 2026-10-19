import axios from "axios";
import { store } from "../reduxStore/store";
import { logout } from "../reduxStore/authSlice";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the auth token from the Redux store (redux-persist keeps this in
// sync with localStorage under the hood — no need to read localStorage here).
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On an expired/invalid token, clear auth state via Redux (redux-persist
// will clear the persisted copy automatically) and send the user to sign in.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
