import axios from 'axios';

const getGuestId = () => {
  let guestId = localStorage.getItem('luxe_guest_id');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('luxe_guest_id', guestId);
  }
  return guestId;
};

// Use the environment variable set in Vercel, fallback to local dev server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://e-commerce-9ou0.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxe_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-guest-id'] = getGuestId();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('luxe_refresh_token');
      if (refreshToken) {
        try {
          // Updated refresh token call to use full API_BASE_URL path
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('luxe_access_token', accessToken);
          localStorage.setItem('luxe_refresh_token', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('luxe_access_token');
          localStorage.removeItem('luxe_refresh_token');
          localStorage.removeItem('luxe_user');
          window.dispatchEvent(new Event('auth-logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);
