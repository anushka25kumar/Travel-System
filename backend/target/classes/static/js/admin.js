/**
 * TravelSmart Admin Portal Management Script (Vanilla JS)
 * Handles metrics, live schedule price & capacity editing, and transport services.
 */

let allSchedules = [];
let allTransports = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin authorization
  const user = window.api.getCurrentUser();
  if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN')) {
    // If not logged in as admin, check if session token exists or show notification
    const banner = document.getElementById('adminAuthNotice');
    if (banner) {
      banner.style.display = 'block';
    }
  }

  // Load KPI reports and data tables
  await loadAdminReports();
  await loadSchedulesTable();
  await loadTransportsTable();

  // Bind Transport Creation Form
  const transportForm = document.getElementById('addTransportForm');
  if (transportForm) {
    transportForm.addEventListener('submit', handleAddTransport);
  }

  // Bind Search Filter
  const scheduleSearch = document.getElementById('scheduleSearchInput');
  if (scheduleSearch) {
    scheduleSearch.addEventListener('input', (e) => {
      filterSchedulesTable(e.target.value);
    });
  }
});

async function loadAdminReports() {
  try {
    const report = await window.api.getAdminReports();
    if (!report) return;

    const elBookings = document.getElementById('kpiTotalBookings');
    const elRevenue = document.getElementById('kpiTotalRevenue');
    const elTransports = document.getElementById('kpiTotalTransports');
    const elSchedules = document.getElementById('kpiTotalSchedules');

    if (elBookings) elBookings.textContent = report.totalBookings || 0;
    if (elRevenue) elRevenue.textContent = `₹${formatINR(report.totalRevenue || 0)}`;
    if (elTransports) elTransports.textContent = report.totalTransports || 0;
    if (elSchedules) elSchedules.textContent = report.totalSchedules || 0;
  } catch (err) {
    console.warn('Could not load admin KPI reports:', err);
  }
}

async function loadSchedulesTable() {
  const tbody = document.getElementById('schedulesTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748B;">Loading schedules from database...</td></tr>`;

  try {
    const schedules = await window.api.get('/schedules');
    allSchedules = schedules || [];
    renderSchedulesTable(allSchedules);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #EF4444;">Failed to load schedules: ${err.message}</td></tr>`;
  }
}

function renderSchedulesTable(schedules) {
  const tbody = document.getElementById('schedulesTableBody');
  if (!tbody) return;

  if (schedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748B;">No schedules matching criteria.</td></tr>`;
    return;
  }

  tbody.innerHTML = schedules.map(s => {
    const route = s.route ? `${s.route.sourceCity?.cityName || 'Unknown'} → ${s.route.destinationCity?.cityName || 'Unknown'}` : 'N/A';
    const transportName = s.transport ? `${s.transport.operatorName} (${s.transport.transportNumber})` : 'N/A';
    const transportType = s.transport ? s.transport.type : 'FLIGHT';
    const typeClass = transportType.toLowerCase();

    return `
      <tr id="schedule-row-${s.scheduleId}">
        <td style="font-weight: 700; color: #10224D;">#${s.scheduleId}</td>
        <td>
          <span class="mode-tag-pill ${typeClass}">${transportType}</span>
          <span style="font-weight: 600; margin-left: 6px;">${transportName}</span>
        </td>
        <td style="font-weight: 600;">${route}</td>
        <td>${formatTime(s.departureTime)} - ${formatTime(s.arrivalTime)}</td>
        <td>
          <div class="table-input-inline">
            <span style="color: #64748B; font-weight: 700;">₹</span>
            <input type="number" id="price-input-${s.scheduleId}" value="${s.basePrice}" class="table-cell-input" min="0" step="10">
          </div>
        </td>
        <td>
          <div class="table-input-inline">
            <input type="number" id="seats-input-${s.scheduleId}" value="${s.availableSeats}" class="table-cell-input" min="0" max="${s.totalSeats || 500}">
            <span style="color: #64748B; font-size: 11px;">/ ${s.totalSeats || '-'}</span>
          </div>
        </td>
        <td>
          <span class="status-indicator ${s.availableSeats > 10 ? 'active' : 'warning'}">
            ${s.availableSeats > 0 ? 'AVAILABLE' : 'SOLD OUT'}
          </span>
        </td>
        <td>
          <button onclick="saveScheduleRow(${s.scheduleId})" class="btn-table-action btn-save-action" title="Save changes">
            Save
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterSchedulesTable(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderSchedulesTable(allSchedules);
    return;
  }

  const filtered = allSchedules.filter(s => {
    const route = s.route ? `${s.route.sourceCity?.cityName} ${s.route.destinationCity?.cityName}`.toLowerCase() : '';
    const operator = s.transport ? `${s.transport.operatorName} ${s.transport.transportNumber} ${s.transport.type}`.toLowerCase() : '';
    const id = String(s.scheduleId);
    return route.includes(q) || operator.includes(q) || id.includes(q);
  });

  renderSchedulesTable(filtered);
}

async function saveScheduleRow(scheduleId) {
  const priceInput = document.getElementById(`price-input-${scheduleId}`);
  const seatsInput = document.getElementById(`seats-input-${scheduleId}`);

  if (!priceInput || !seatsInput) return;

  const newPrice = parseFloat(priceInput.value);
  const newSeats = parseInt(seatsInput.value);

  if (isNaN(newPrice) || newPrice < 0) {
    alert('Please enter a valid price in INR (₹).');
    return;
  }
  if (isNaN(newSeats) || newSeats < 0) {
    alert('Please enter a valid seat count.');
    return;
  }

  try {
    const res = await window.api.updateSchedulePriceAndSeats(scheduleId, newPrice, newSeats);
    alert(`✓ Schedule #${scheduleId} successfully updated!\nBase Price: ₹${formatINR(res.basePrice)}\nAvailable Seats: ${res.availableSeats}`);
    await loadAdminReports();
  } catch (err) {
    alert('Failed to update schedule: ' + err.message);
  }
}

async function loadTransportsTable() {
  const tbody = document.getElementById('transportsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748B;">Loading transports...</td></tr>`;

  try {
    const transports = await window.api.get('/transports');
    allTransports = transports || [];
    renderTransportsTable(allTransports);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #EF4444;">Failed to load transports: ${err.message}</td></tr>`;
  }
}

function renderTransportsTable(transports) {
  const tbody = document.getElementById('transportsTableBody');
  if (!tbody) return;

  if (transports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748B;">No transports found.</td></tr>`;
    return;
  }

  tbody.innerHTML = transports.map(t => {
    return `
      <tr>
        <td style="font-weight: 700;">#${t.transportId}</td>
        <td><span class="mode-tag-pill ${t.type.toLowerCase()}">${t.type}</span></td>
        <td style="font-weight: 600; color: #10224D;">${t.operatorName}</td>
        <td><code>${t.transportNumber}</code></td>
        <td>${t.capacity} seats</td>
        <td>${t.avgSpeedKmh || '-'} km/h</td>
        <td>
          <button onclick="deleteTransportItem(${t.transportId})" class="btn-table-action btn-delete-action" title="Delete transport">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function handleAddTransport(e) {
  e.preventDefault();
  const type = document.getElementById('newTransportType').value;
  const operatorName = document.getElementById('newTransportOperator').value.trim();
  const transportNumber = document.getElementById('newTransportNumber').value.trim();
  const capacity = parseInt(document.getElementById('newTransportCapacity').value) || 100;
  const avgSpeedKmh = parseInt(document.getElementById('newTransportSpeed').value) || 80;
  const carbonGPerKm = parseInt(document.getElementById('newTransportCarbon').value) || 40;

  if (!operatorName || !transportNumber) {
    alert('Please enter operator name and transport/service number.');
    return;
  }

  try {
    const payload = {
      type,
      operatorName,
      transportNumber,
      capacity,
      avgSpeedKmh,
      carbonGPerKm
    };

    await window.api.addTransport(payload);
    alert(`✓ Transport Service "${operatorName} (${transportNumber})" added successfully.`);
    document.getElementById('addTransportForm').reset();
    await loadTransportsTable();
    await loadAdminReports();
  } catch (err) {
    alert('Failed to add transport: ' + err.message);
  }
}

async function deleteTransportItem(id) {
  if (!confirm(`Are you sure you want to delete transport #${id}? This will remove associated schedules.`)) {
    return;
  }

  try {
    await window.api.deleteTransport(id);
    alert(`✓ Transport #${id} deleted.`);
    await loadTransportsTable();
    await loadSchedulesTable();
    await loadAdminReports();
  } catch (err) {
    alert('Failed to delete transport: ' + err.message);
  }
}

function formatTime(t) {
  if (!t) return '--:--';
  if (typeof t === 'string') return t.substring(0, 5);
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
}

function formatINR(val) {
  if (!val) return '0';
  return Number(val).toLocaleString('en-IN');
}
