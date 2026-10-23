import axios from 'axios';

// API Client - configured with base URL
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const travelApi = {
  // Multimodal Search
  searchJourneys: async (params) => {
    const response = await api.get('/search', { params });
    return response.data;
  },
  searchLive: async (params) => {
    const response = await api.get('/search/live', { params });
    return response.data;
  },
  getProviderStatuses: async () => {
    const response = await api.get('/providers/status');
    return response.data;
  },
  revalidateOffer: async (payload) => {
    const response = await api.post('/offers/revalidate', payload);
    return response.data;
  },

  // Direct Mode Endpoints
  getFlights: async () => {
    const response = await api.get('/flights');
    return response.data;
  },
  getTrains: async () => {
    const response = await api.get('/trains');
    return response.data;
  },
  getBuses: async () => {
    const response = await api.get('/buses');
    return response.data;
  },

  // Hybrid Journeys
  getRecommendedHybrids: async (source, destination) => {
    const response = await api.get('/hybrid/recommended', {
      params: { source, destination }
    });
    return response.data;
  },

  // Custom Hybrid Route Builder (Flagship Feature)
  calculateCustomHybrid: async (customRequest) => {
    const response = await api.post('/hybrid/custom/search', customRequest);
    return response.data;
  },
  saveCustomHybrid: async (customRequest) => {
    const response = await api.post('/hybrid/save', customRequest);
    return response.data;
  },
  getSavedCustomJourneys: async () => {
    const response = await api.get('/hybrid/custom/all');
    return response.data;
  },

  // Bookings & Tickets
  getBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },
  getBooking: async (reference) => {
    const response = await api.get(`/bookings/${reference}`);
    return response.data;
  },
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },
  cancelBooking: async (reference) => {
    const response = await api.delete(`/bookings/${reference}`);
    return response.data;
  },

  // Indian Airports & Cities APIs
  getAirports: async () => {
    const response = await api.get('/airports');
    return response.data;
  },
  searchAirports: async (query) => {
    const response = await api.get('/airports/search', { params: { query } });
    return response.data;
  },
  getAirportByCode: async (code) => {
    const response = await api.get(`/airports/${code}`);
    return response.data;
  },
  getCities: async () => {
    const response = await api.get('/cities');
    return response.data;
  },
  searchCities: async (query) => {
    const response = await api.get('/cities/search', { params: { query } });
    return response.data;
  },

  // Geographic Locations & Hubs
  getLocations: async () => {
    const response = await api.get('/locations');
    return response.data;
  },
};

export default api;
