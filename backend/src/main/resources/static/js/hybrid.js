/**
 * TravelSmart - Choose Your Own Hybrid Journey (Vanilla JS + Leaflet)
 * Flagship Route Builder & Validator
 */

let customLegs = [
  { legOrder: 1, fromCity: 'Pune', toCity: 'Mumbai', preferredMode: 'BUS' },
  { legOrder: 2, fromCity: 'Mumbai', toCity: 'Jaipur', preferredMode: 'FLIGHT' },
  { legOrder: 3, fromCity: 'Jaipur', toCity: 'Delhi', preferredMode: 'TRAIN' }
];

let hybridMap = null;
let mapLayers = [];

document.addEventListener('DOMContentLoaded', () => {
  initHybridMap();
  renderLegsList();
  validateAndRecalculate();

  const btnAdd = document.getElementById('btnAddLeg');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => {
      if (customLegs.length >= 5) {
        alert('A maximum of 5 transfer legs is supported.');
        return;
      }
      const prevDest = customLegs.length > 0 ? customLegs[customLegs.length - 1].toCity : 'Delhi';
      customLegs.push({
        legOrder: customLegs.length + 1,
        fromCity: prevDest,
        toCity: 'Chandigarh',
        preferredMode: 'TRAIN'
      });
      renderLegsList();
      validateAndRecalculate();
    });
  }

  const btnSave = document.getElementById('btnSaveHybrid');
  if (btnSave) {
    btnSave.addEventListener('click', saveCustomJourney);
  }
});

function renderLegsList() {
  const container = document.getElementById('legsContainer');
  if (!container) return;

  container.innerHTML = customLegs.map((leg, index) => {
    return `
      <div class="leg-card" id="legCard_${index}">
        <div class="leg-card-top">
          <span class="leg-badge">LEG ${index + 1}</span>
          ${customLegs.length > 1 ? `
            <button onclick="removeLeg(${index})" class="btn-remove-leg">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Remove
            </button>
          ` : ''}
        </div>

        <div class="leg-controls-grid">
          <div class="input-field-group">
            <label>Departing From</label>
            <input type="text" value="${leg.fromCity}" class="input-control" onchange="updateLegField(${index}, 'fromCity', this.value)" ${index > 0 ? 'readonly style="background: #F1F5F9;"' : ''}>
          </div>

          <div class="input-field-group">
            <label>Destination</label>
            <input type="text" value="${leg.toCity}" class="input-control" onchange="updateLegField(${index}, 'toCity', this.value)">
          </div>

          <div class="input-field-group">
            <label>Transport Mode</label>
            <div class="mode-radio-group">
              <button type="button" class="mode-radio-btn ${leg.preferredMode === 'FLIGHT' ? 'active' : ''}" onclick="setLegMode(${index}, 'FLIGHT')">Flight</button>
              <button type="button" class="mode-radio-btn ${leg.preferredMode === 'TRAIN' ? 'active' : ''}" onclick="setLegMode(${index}, 'TRAIN')">Train</button>
              <button type="button" class="mode-radio-btn ${leg.preferredMode === 'BUS' ? 'active' : ''}" onclick="setLegMode(${index}, 'BUS')">Bus</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function updateLegField(index, field, value) {
  customLegs[index][field] = value.trim();
  // Auto-chain next leg's origin
  if (field === 'toCity' && index < customLegs.length - 1) {
    customLegs[index + 1].fromCity = value.trim();
  }
  renderLegsList();
  validateAndRecalculate();
}

function setLegMode(index, mode) {
  customLegs[index].preferredMode = mode;
  renderLegsList();
  validateAndRecalculate();
}

function removeLeg(index) {
  customLegs.splice(index, 1);
  // Re-order and reconnect
  for (let i = 0; i < customLegs.length; i++) {
    customLegs[i].legOrder = i + 1;
    if (i > 0) {
      customLegs[i].fromCity = customLegs[i - 1].toCity;
    }
  }
  renderLegsList();
  validateAndRecalculate();
}

async function validateAndRecalculate() {
  const alertsContainer = document.getElementById('hybridAlerts');
  const priceValue = document.getElementById('totalPriceValue');
  const durationValue = document.getElementById('totalDurationValue');
  const layoverValue = document.getElementById('totalLayoverValue');
  const co2Value = document.getElementById('co2SavedValue');
  const riskBadge = document.getElementById('transferRiskBadge');

  try {
    const payload = {
      journeyName: 'Custom Multimodal Route',
      originCity: customLegs[0].fromCity,
      destinationCity: customLegs[customLegs.length - 1].toCity,
      passengers: 1,
      legs: customLegs
    };

    const res = await window.api.validateCustomHybrid(payload);

    if (priceValue) priceValue.textContent = `₹${formatINR(res.totalPrice)}`;
    if (durationValue) durationValue.textContent = formatDuration(res.totalDurationMinutes);
    if (layoverValue) layoverValue.textContent = `${res.totalLayoverMinutes} mins`;
    if (co2Value) co2Value.textContent = `-${res.co2SavedPercent}%`;
    if (riskBadge) {
      riskBadge.textContent = `${res.riskLevel} RISK`;
      riskBadge.style.background = res.riskLevel === 'LOW' ? '#ECFDF5' : res.riskLevel === 'MEDIUM' ? '#FEF3C7' : '#FEF2F2';
      riskBadge.style.color = res.riskLevel === 'LOW' ? '#065F46' : res.riskLevel === 'MEDIUM' ? '#92400E' : '#B91C1C';
    }

    if (alertsContainer) {
      if (!res.valid) {
        alertsContainer.innerHTML = `<div class="alert-item warning"><i data-lucide="alert-triangle"></i> ${res.statusMessage}</div>`;
      } else {
        alertsContainer.innerHTML = res.transferAlerts.map(a =>
          `<div class="alert-item ${a.includes('Tight') ? 'warning' : 'info'}"><i data-lucide="${a.includes('Tight') ? 'clock' : 'check-circle'}"></i> ${a}</div>`
        ).join('');
      }
      if (window.lucide) window.lucide.createIcons();
    }

    plotCustomRouteOnMap(customLegs);
  } catch (err) {
    console.error('Validation error:', err);
  }
}

async function saveCustomJourney() {
  const btn = document.getElementById('btnSaveHybrid');
  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving to MySQL...';
    }

    const payload = {
      journeyName: `${customLegs[0].fromCity} to ${customLegs[customLegs.length - 1].toCity} Custom Hybrid`,
      originCity: customLegs[0].fromCity,
      destinationCity: customLegs[customLegs.length - 1].toCity,
      passengers: 1,
      legs: customLegs
    };

    const res = await window.api.saveHybridJourney(payload);
    alert(`✓ Custom Hybrid Journey Saved Successfully!\nSaved ID: ${res.hybridJourneyId}\nTotal Fare: ₹${formatINR(res.totalPrice)}\n\nThis journey is now stored in MySQL and will persist across refreshes.`);
  } catch (e) {
    alert('Failed to save hybrid journey: ' + e.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Save Journey to Database';
    }
  }
}

function initHybridMap() {
  const elem = document.getElementById('hybridMapContainer');
  if (!elem || typeof L === 'undefined') return;

  hybridMap = L.map('hybridMapContainer').setView([22.5, 78.5], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(hybridMap);
}

function plotCustomRouteOnMap(legs) {
  if (!hybridMap || typeof L === 'undefined') return;

  mapLayers.forEach(l => hybridMap.removeLayer(l));
  mapLayers = [];

  const cityCoords = {
    'pune': [18.5204, 73.8567],
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'bengaluru': [12.9716, 77.5946],
    'hyderabad': [17.3850, 78.4867],
    'chennai': [13.0827, 80.2707],
    'jaipur': [26.9124, 75.7873],
    'ahmedabad': [23.0225, 72.5714],
    'chandigarh': [30.7333, 76.7794],
    'goa': [15.2993, 74.1240]
  };

  const points = [];
  legs.forEach((leg, i) => {
    const c1 = cityCoords[leg.fromCity.toLowerCase()] || [18.5204, 73.8567];
    const c2 = cityCoords[leg.toCity.toLowerCase()] || [28.6139, 77.2090];
    points.push(c1);
    if (i === legs.length - 1) points.push(c2);

    const m = L.marker(c1).bindPopup(`<b>Stop ${i + 1}:</b> ${leg.fromCity}`).addTo(hybridMap);
    mapLayers.push(m);

    const color = leg.preferredMode === 'FLIGHT' ? '#1677FF' : leg.preferredMode === 'TRAIN' ? '#722ED1' : '#D46B08';
    const poly = L.polyline([c1, c2], {
      color: color,
      weight: 5,
      opacity: 0.9,
      dashArray: leg.preferredMode === 'FLIGHT' ? '6, 6' : null
    }).addTo(hybridMap);
    mapLayers.push(poly);
  });

  if (points.length > 0) {
    const last = points[points.length - 1];
    const mEnd = L.marker(last).bindPopup(`<b>Final Destination:</b> ${legs[legs.length - 1].toCity}`).addTo(hybridMap);
    mapLayers.push(mEnd);
    hybridMap.fitBounds(points, { padding: [50, 50] });
  }
}

function formatDuration(mins) {
  if (!mins) return '0h 0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function formatINR(val) {
  if (!val) return '0';
  return Number(val).toLocaleString('en-IN');
}
