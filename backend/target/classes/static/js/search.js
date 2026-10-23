/**
 * TravelSmart Search & Results Script (Vanilla JS + Leaflet + Lucide)
 */

let currentJourneys = [];
let activeMode = 'ALL';
let currentSort = 'RECOMMENDED';
let leafletMap = null;
let mapLayers = [];
let autoRefreshTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  initCitiesDropdowns();
  initLeafletMap();

  // Read URL query parameters if present (e.g. from index.html quick search)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('source')) document.getElementById('searchSource').value = urlParams.get('source');
  if (urlParams.get('destination')) document.getElementById('searchDest').value = urlParams.get('destination');
  if (urlParams.get('date')) document.getElementById('searchDate').value = urlParams.get('date');
  if (urlParams.get('passengers')) document.getElementById('searchPassengers').value = urlParams.get('passengers');

  // Trigger initial search
  await executeSearch();

  // Start 10-second automatic refresh from MySQL
  startAutoRefresh();

  // Bind Form Search
  const searchBtn = document.getElementById('btnSubmitSearch');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      executeSearch();
    });
  }

  // Bind Mode Tabs
  document.querySelectorAll('.mode-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMode = btn.dataset.mode || 'ALL';
      executeSearch();
    });
  });

  // Bind Sort Dropdown
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      executeSearch();
    });
  }

  // Handle visibility changes to avoid unnecessary background polling
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && currentJourneys && currentJourneys.length > 0) {
      executeSearch(true); // Immediate silent refresh upon returning to tab
    }
  });
});

async function initCitiesDropdowns() {
  try {
    const cities = await window.api.getCities();
    const srcDatalist = document.getElementById('citiesSourceList');
    const dstDatalist = document.getElementById('citiesDestList');

    if (srcDatalist && dstDatalist && cities) {
      srcDatalist.innerHTML = '';
      dstDatalist.innerHTML = '';
      cities.forEach(c => {
        const opt1 = document.createElement('option');
        opt1.value = c.cityName;
        srcDatalist.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = c.cityName;
        dstDatalist.appendChild(opt2);
      });
    }
  } catch (e) {
    console.error('Failed to load cities from MySQL:', e);
  }
}

function setQuickRoute(src, dst) {
  document.getElementById('searchSource').value = src;
  document.getElementById('searchDest').value = dst;
  executeSearch();
}

function startAutoRefresh() {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
  autoRefreshTimer = setInterval(() => {
    // Only refresh if tab is currently visible
    if (!document.hidden && currentJourneys && currentJourneys.length > 0) {
      executeSearch(true); // Silent background refresh
    }
  }, 10000); // 10 seconds
}

async function executeSearch(silent = false) {
  const source = document.getElementById('searchSource').value.trim() || 'Pune';
  const destination = document.getElementById('searchDest').value.trim() || 'Delhi';
  const date = document.getElementById('searchDate').value || '2026-10-25';
  const passengers = parseInt(document.getElementById('searchPassengers').value) || 1;

  const resultsList = document.getElementById('journeyResultsList');
  const countBadge = document.getElementById('resultsCountBadge');
  const statusMsg = document.getElementById('searchStatusMessage');

  if (resultsList && !silent) {
    resultsList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #64748B;">
        <div class="spinner" style="border: 3px solid #E2E8F0; border-top: 3px solid #1677FF; border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite; margin: 0 auto 12px;"></div>
        <p style="font-weight: 600;">Querying MySQL database for transport schedules...</p>
      </div>
    `;
  }

  try {
    const res = await window.api.search({
      source,
      destination,
      date,
      passengers,
      mode: activeMode,
      sortBy: currentSort
    });

    currentJourneys = res.journeys || [];
    window.currentJourneys = currentJourneys;

    if (countBadge) countBadge.textContent = `${currentJourneys.length} Options`;
    if (statusMsg) {
      statusMsg.textContent = res.status?.statusMessage || `Showing ${currentJourneys.length} verified schedules from MySQL database.`;
    }

    renderJourneyCards(currentJourneys);

    if (currentJourneys.length > 0 && !silent) {
      plotJourneyOnMap(currentJourneys[0]);
    }
  } catch (err) {
    if (resultsList) {
      resultsList.innerHTML = `
        <div class="empty-results-box" style="border-color: #FECACA; background: #FFF5F5;">
          <i data-lucide="database" style="width: 48px; height: 48px; color: #EF4444; margin: 0 auto;"></i>
          <h3 style="color: #991B1B;">Database Connection Error</h3>
          <p style="color: #7F1D1D; font-weight: 600;">
            ${err.message || 'Could not connect to MySQL database at localhost:3306.'}
          </p>
          <p style="font-size: 12px; color: #64748B; margin-top: 4px;">
            MySQL is the single source of truth. Please verify MySQL service is running on port 3306 and DB_PASSWORD is set.
          </p>
          <button onclick="executeSearch()" class="btn-secondary" style="margin-top: 10px;">Retry Search</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function renderJourneyCards(journeys) {
  const container = document.getElementById('journeyResultsList');
  if (!container) return;

  if (journeys.length === 0) {
    container.innerHTML = `
      <div class="empty-results-box">
        <i data-lucide="compass" style="width: 48px; height: 48px; color: #94A3B8; margin: 0 auto;"></i>
        <h3>No Transport Schedules Found</h3>
        <p>No direct schedules match the selected cities in the MySQL demo database. Try popular corridors like Pune → Delhi, Pune → Mumbai, or Chandigarh → Delhi.</p>
        <button onclick="setQuickRoute('Pune', 'Delhi')" class="btn-secondary">Search Pune → Delhi</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = journeys.map(j => {
    const mode = j.transportMode || j.journeyType || 'FLIGHT';
    const recTag = j.recommendationTag ? `<span class="recommendation-pill ${j.recommendationTag}">${j.recommendationTag}</span>` : '';
    const seatsClass = j.availableSeats <= 10 ? 'low' : '';

    return `
      <div class="journey-card" onclick="selectJourneyForMap('${j.id}')">
        <div class="journey-card-header">
          <div class="operator-badge">
            <div class="mode-icon-tag ${mode}">
              <i data-lucide="${getModeIcon(mode)}"></i>
            </div>
            <div>
              <div class="operator-title">${j.operatorName || j.title}</div>
              <div class="service-num">${j.serviceNumber || 'Regular Service'} • <span class="status-badge-demo">${j.dataSource || 'DEMO'}</span></div>
            </div>
          </div>
          <div>${recTag}</div>
        </div>

        <div class="journey-timeline-grid">
          <div class="time-box">
            <h4>${formatTime(j.departureTime)}</h4>
            <p>${j.sourceCity}</p>
          </div>

          <div class="timeline-track-col">
            <div class="duration-label">${formatDuration(j.totalDurationMinutes)}</div>
            <div class="timeline-line"></div>
            <div class="transfer-info">${j.transfersCount > 0 ? `${j.transfersCount} Transfer` : 'Direct Non-Stop'}</div>
          </div>

          <div class="time-box">
            <h4>${formatTime(j.arrivalTime)}</h4>
            <p>${j.destCity}</p>
          </div>

          <div class="price-action-col">
            <div class="price-display">₹${formatINR(j.totalPrice)}</div>
            <div class="seats-badge ${seatsClass}">${j.availableSeats} Seats Available</div>
            <button onclick="openBookingModal('${j.id}')" class="btn-book">Book Now</button>
          </div>
        </div>

        <div class="journey-card-footer">
          <div class="amenities-list">
            <span><i data-lucide="shield-check" style="width: 14px; height: 14px; display: inline; vertical-align: middle;"></i> Verified Schedule</span>
            <span><i data-lucide="leaf" style="width: 14px; height: 14px; display: inline; vertical-align: middle; color: #10B981;"></i> ${j.totalCo2Kg || 42} kg CO₂</span>
          </div>
          <span style="cursor: pointer; color: #1677FF; font-weight: 600;" onclick="selectJourneyForMap('${j.id}')">
            View Route on Map →
          </span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function initLeafletMap() {
  const mapElement = document.getElementById('routeMapContainer');
  if (!mapElement || typeof L === 'undefined') return;

  leafletMap = L.map('routeMapContainer').setView([20.5937, 78.9629], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(leafletMap);
}

function selectJourneyForMap(journeyId) {
  const j = currentJourneys.find(item => item.id === journeyId);
  if (j) plotJourneyOnMap(j);
}

function plotJourneyOnMap(journey) {
  if (!leafletMap || typeof L === 'undefined') return;

  // Clear existing layers
  mapLayers.forEach(l => leafletMap.removeLayer(l));
  mapLayers = [];

  const cityCoords = {
    'pune': [18.5204, 73.8567],
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'new delhi': [28.6139, 77.2090],
    'bengaluru': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'chennai': [13.0827, 80.2707],
    'jaipur': [26.9124, 75.7873],
    'ahmedabad': [23.0225, 72.5714],
    'chandigarh': [30.7333, 76.7794],
    'lucknow': [26.8467, 80.9462],
    'bhopal': [23.2599, 77.4126],
    'nagpur': [21.1458, 79.0882],
    'goa': [15.2993, 74.1240],
    'kolkata': [22.5726, 88.3639],
    'indore': [22.7196, 75.8577],
    'surat': [21.1702, 72.8311],
    'varanasi': [25.3176, 82.9739],
    'kochi': [9.9312, 76.2673],
    'patna': [25.5941, 85.1376],
    'amritsar': [31.6340, 74.8723]
  };

  const srcKey = (journey.sourceCity || 'Pune').toLowerCase();
  const dstKey = (journey.destCity || 'Delhi').toLowerCase();
  const c1 = cityCoords[srcKey] || [18.5204, 73.8567];
  const c2 = cityCoords[dstKey] || [28.6139, 77.2090];

  const m1 = L.marker(c1).bindPopup(`<b>Origin:</b> ${journey.sourceCity}`).addTo(leafletMap);
  const m2 = L.marker(c2).bindPopup(`<b>Destination:</b> ${journey.destCity}`).addTo(leafletMap);
  mapLayers.push(m1, m2);

  const mode = journey.transportMode || 'FLIGHT';
  const color = mode === 'FLIGHT' ? '#1677FF' : mode === 'TRAIN' ? '#722ED1' : mode === 'BUS' ? '#D46B08' : '#08979C';

  const polyline = L.polyline([c1, c2], {
    color: color,
    weight: 4,
    opacity: 0.85,
    dashArray: mode === 'FLIGHT' ? '8, 8' : null
  }).addTo(leafletMap);
  mapLayers.push(polyline);

  leafletMap.fitBounds([c1, c2], { padding: [50, 50] });
}

function getModeIcon(mode) {
  if (mode === 'FLIGHT') return 'plane';
  if (mode === 'TRAIN') return 'train';
  if (mode === 'BUS') return 'bus';
  return 'sparkles';
}

function formatTime(t) {
  if (!t) return '--:--';
  if (typeof t === 'string') return t.substring(0, 5);
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

function formatDuration(mins) {
  if (!mins) return '2h 15m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatINR(val) {
  if (!val) return '0';
  return Number(val).toLocaleString('en-IN');
}
