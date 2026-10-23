/**
 * TravelSmart API Client (Vanilla JavaScript Fetch API)
 * Communicates with Java Spring Boot REST endpoints on same host.
 */

// Global Formatters for all TravelSmart pages
window.formatINR = function(val) {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

window.formatTime = function(t) {
  if (!t) return '--:--';
  if (typeof t === 'string' && t.length >= 5) return t.substring(0, 5);
  return t;
};

window.formatDuration = function(mins) {
  if (!mins) return '--';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

window.formatDateTime = function(dt) {
  if (!dt) return '--';
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (_) {
    return String(dt);
  }
};

const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('ts_token') || null;
    this.user = JSON.parse(localStorage.getItem('ts_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    if (token) localStorage.setItem('ts_token', token);
    else localStorage.removeItem('ts_token');
    if (user) localStorage.setItem('ts_user', JSON.stringify(user));
    else localStorage.removeItem('ts_user');
  }

  getCurrentUser() {
    if (!this.user) {
      try {
        this.user = JSON.parse(localStorage.getItem('ts_user') || 'null');
        this.token = localStorage.getItem('ts_token') || null;
      } catch (_) {}
    }
    return this.user;
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (this.token) {
      const cleanToken = this.token.startsWith('Bearer ') ? this.token.substring(7).trim() : this.token.trim();
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const config = {
      cache: 'no-store',
      ...options,
      headers: this.getHeaders(options.headers || {})
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        let errData = {};
        try {
          errData = await response.json();
        } catch (_) {}
        const errorMsg = errData.error || errData.message || `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = errData;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) return null;
      return await response.json();
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const queryParams = { ...params, _t: Date.now() };
    const query = new URLSearchParams(queryParams).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Domain Specific APIs
  async getCities(query = '') {
    return this.get(query ? `/cities/search?query=${encodeURIComponent(query)}` : '/cities');
  }

  async search(params) {
    return this.get('/search', params);
  }

  async validateCustomHybrid(data) {
    return this.post('/hybrid/search', data);
  }

  async saveHybridJourney(data) {
    const userId = this.user ? this.user.userId : 2;
    return this.post(`/hybrid/save?userId=${userId}`, data);
  }

  async getMySavedJourneys() {
    const userId = this.user ? this.user.userId : 2;
    return this.get(`/hybrid/my-journeys?userId=${userId}`);
  }

  async createBooking(bookingData) {
    const user = this.getCurrentUser();
    let url = '/bookings';
    if (user) {
      const uid = user.userId || user.id;
      if (uid && !isNaN(uid)) {
        url = `/bookings?userId=${Number(uid)}`;
      }
    }
    const res = await this.post(url, bookingData);
    if (!user && res && (res.passengerEmail || res.contactEmail)) {
      const email = res.passengerEmail || res.contactEmail;
      const name = res.passengerName || res.contactName || 'Traveler';
      const fallbackUser = {
        userId: res.userId || res.rawId || 2,
        email: email,
        fullName: name,
        role: 'ROLE_USER'
      };
      this.setSession('TS-SESSION-' + fallbackUser.userId, fallbackUser);
    }
    return res;
  }

  async getMyBookings() {
    const user = this.getCurrentUser();
    const params = {};
    if (user) {
      const uid = user.userId || user.id;
      if (uid && !isNaN(uid)) {
        params.userId = Number(uid);
      }
    }
    return this.get('/bookings/my', params);
  }

  async cancelBooking(bookingId) {
    const user = this.getCurrentUser();
    const cleanId = String(bookingId).replace(/[^0-9]/g, '');
    let url = `/bookings/${cleanId || bookingId}/cancel`;
    if (user) {
      const uid = user.userId || user.id;
      if (uid && !isNaN(uid)) {
        url += `?userId=${Number(uid)}`;
      }
    }
    return this.post(url);
  }

  async login(email, password) {
    const res = await this.post('/auth/login', { email, password });
    if (res && res.token) {
      this.setSession(res.token, res);
    }
    return res;
  }

  async register(fullName, email, phone, password, role = 'ROLE_USER') {
    const res = await this.post('/auth/register', { fullName, email, phone, password, role });
    if (res && res.token) {
      this.setSession(res.token, res);
    }
    return res;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (_) {}
    this.setSession(null, null);
    window.location.href = '/login.html';
  }

  // Admin APIs
  async getAdminReports() {
    return this.get('/admin/reports');
  }

  async updateSchedulePriceAndSeats(scheduleId, basePrice, availableSeats) {
    return this.put(`/admin/schedules/${scheduleId}`, { basePrice, availableSeats });
  }

  async addTransport(transportData) {
    return this.post('/admin/transport', transportData);
  }

  async deleteTransport(transportId) {
    return this.delete(`/admin/transport/${transportId}`);
  }
}

// Global API instance
window.api = new ApiClient();
