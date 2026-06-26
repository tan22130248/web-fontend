import axios from "axios";

// ─── Constants ───────────────────────────────────────────────────────────────
const AUTH_TOKEN_KEY = "token";
const REFRESH_ENDPOINT = "/api/auth/refresh";

// ─── Redirect helpers ────────────────────────────────────────────────────────

/** Clear auth data from localStorage */
function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("user");
}

/** Navigate to the login page */
function redirectLogin() {
  if (window.location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
}

/** Save current path, clear auth data, then redirect to login */
function redirectLoginAndResetParam() {
  localStorage.setItem("PATH", window.location.pathname);
  removeToken();
  redirectLogin();
}

// ─── Http class ──────────────────────────────────────────────────────────────

class Http {
  constructor(baseURL) {
    this.baseUrl = baseURL;
    this.subscribers = [];
    this.isRefreshingToken = false;

    this.instance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Set initial token if it exists
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      this.instance.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
    }

    this.instance.interceptors.request.use(
      this._handleBeforeRequest.bind(this),
    );

    this.instance.interceptors.response.use(
      this._handleSuccess,
      this._handleRequestError.bind(this),
    );
  }

  // ── Interceptors ─────────────────────────────────────────────────────────

  _handleBeforeRequest(request) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    } else {
      delete request.headers.Authorization;
    }
    return request;
  }

  _handleSuccess(response) {
    return response;
  }

  async _handleRequestError(error) {
    // Network error — no response at all
    if (error.code === "ERR_NETWORK" || !error.response) {
      return Promise.reject(error);
    }

    // const { config: originalRequest, response } = error;
    const status = response.status;

    // // ── 401 Unauthorized → attempt token refresh ───────────────────────
    // if (status === 401 && window.location.pathname !== "/auth") {
    //   // If already refreshing, queue this request and wait
    //   if (this.isRefreshingToken) {
    //     return new Promise((resolve, reject) => {
    //       this.subscribers.push((token) => {
    //         if (token) {
    //           originalRequest.headers.Authorization = `Bearer ${token}`;
    //           resolve(this.instance(originalRequest));
    //         } else {
    //           reject(error);
    //         }
    //       });
    //     });
    //   }
    //
    //   try {
    //     this.isRefreshingToken = true;
    //
    //     const refreshResponse = await axios.post(
    //       this.baseUrl + REFRESH_ENDPOINT,
    //       {},
    //       { withCredentials: true },
    //     );
    //
    //     const data = refreshResponse.data;
    //     if (data?.data?.token) {
    //       const newToken = data.data.token;
    //       localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    //       this.instance.defaults.headers.common["Authorization"] =
    //         `Bearer ${newToken}`;
    //
    //       // Resolve all queued requests with the new token
    //       this.subscribers.forEach((callback) => callback(newToken));
    //       this.subscribers = [];
    //
    //       // Retry the original request
    //       originalRequest.headers.Authorization = `Bearer ${newToken}`;
    //       return this.instance(originalRequest);
    //     }
    //   } catch (_err) {
    //     // Refresh failed — reject all queued requests and redirect
    //     this.subscribers.forEach((callback) => callback(null));
    //     this.subscribers = [];
    //     removeToken();
    //     redirectLogin();
    //   } finally {
    //     this.isRefreshingToken = false;
    //   }
    // }

    // ── 403 Forbidden → redirect to login ──────────────────────────────
    if (status === 403) {
      redirectLoginAndResetParam();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }

  // ── Public HTTP methods ──────────────────────────────────────────────────

  async get(url, params) {
    console.log('🌐 HTTP GET:', url, 'params:', params);
    const response = await this.instance.get(url, { params });
    console.log('✅ HTTP Response:', url, 'data:', response.data);
    return response.data;
  }

  async post(url, data) {
    const response = await this.instance.post(url, data);
    return response.data;
  }

  async postWithFile(url, data) {
    const response = await this.instance.post(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async put(url, data) {
    const response = await this.instance.put(url, data);
    return response.data;
  }

  async patch(url, data) {
    const response = await this.instance.patch(url, data);
    return response.data;
  }

  async delete(url) {
    const response = await this.instance.delete(url);
    return response.data;
  }

  async exportFile(url) {
    const response = await this.instance.get(url, { responseType: "blob" });
    return response.data;
  }

  async exportFileWithData(url, data) {
    const response = await this.instance.request({
      method: "POST",
      url,
      data,
      responseType: "blob",
    });
    return response.data;
  }

  /** Expose the raw axios instance for advanced usage */
  getAxiosInstance() {
    return this.instance;
  }
}

const http = new Http(process.env.REACT_APP_API_URL);

export { Http, removeToken, redirectLogin, redirectLoginAndResetParam };
export default http;
