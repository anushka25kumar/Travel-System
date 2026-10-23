/**
 * TravelSmart Booking Modal & Checkout Script (Vanilla JS)
 */

if (typeof window.formatINR !== 'function') {
  window.formatINR = function(val) {
    if (val === null || val === undefined) return '0';
    return Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };
}
if (typeof window.formatTime !== 'function') {
  window.formatTime = function(t) {
    if (!t) return '--:--';
    if (typeof t === 'string' && t.length >= 5) return t.substring(0, 5);
    return t;
  };
}
if (typeof window.formatDateTime !== 'function') {
  window.formatDateTime = function(dt) {
    if (!dt) return '';
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
}

let activeBookingJourney = null;

function openBookingModal(journeyId) {
  const journey = (window.currentJourneys || []).find(j => j.id === journeyId);
  if (!journey) {
    alert('Journey details not found. Please try again.');
    return;
  }

  activeBookingJourney = journey;
  const modal = document.getElementById('bookingModal');
  const modalTitle = document.getElementById('bookingModalTitle');
  const modalDetails = document.getElementById('bookingModalDetails');
  const modalTotal = document.getElementById('bookingModalTotal');
  const alertBox = document.getElementById('bookingModalAlert');

  if (alertBox) alertBox.style.display = 'none';

  if (modalTitle) {
    modalTitle.textContent = `Book: ${journey.operatorName || journey.title}`;
  }

  if (modalDetails) {
    modalDetails.innerHTML = `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: 700; color: #10224D;">${journey.sourceCity} → ${journey.destCity}</span>
          <span style="font-weight: 700; color: #1677FF;">${journey.transportMode}</span>
        </div>
        <div style="font-size: 13px; color: #64748B;">
          Departure: <b>${formatTime(journey.departureTime)}</b> | Arrival: <b>${formatTime(journey.arrivalTime)}</b>
        </div>
        <div style="font-size: 12px; color: #059669; margin-top: 6px; font-weight: 600;">
          ✓ ${journey.availableSeats} seats remaining • Timetable verified
        </div>
      </div>
    `;
  }

  if (modalTotal) {
    modalTotal.textContent = `₹${formatINR(journey.totalPrice)}`;
  }

  // Pre-fill user data if logged in
  const user = window.api.getCurrentUser();
  if (user) {
    if (document.getElementById('passengerName')) document.getElementById('passengerName').value = user.fullName || '';
    if (document.getElementById('passengerEmail')) document.getElementById('passengerEmail').value = user.email || '';
    if (document.getElementById('passengerPhone')) document.getElementById('passengerPhone').value = user.phone || '';
  }

  if (modal) modal.classList.add('active');
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) modal.classList.remove('active');
  activeBookingJourney = null;
}

document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeBookingJourney) return;

      const submitBtn = document.getElementById('btnConfirmBooking');
      const alertBox = document.getElementById('bookingModalAlert');
      const name = document.getElementById('passengerName').value.trim();
      const email = document.getElementById('passengerEmail').value.trim();
      const phone = document.getElementById('passengerPhone').value.trim();

      if (!name || !email) {
        alert('Please provide passenger name and email.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Reserving Seats in MySQL...';
      }

      try {
        const payload = {
          scheduleId: activeBookingJourney.scheduleId || (activeBookingJourney.id && !isNaN(activeBookingJourney.id) ? Number(activeBookingJourney.id) : null),
          journeyOptionId: activeBookingJourney.id,
          sourceCity: activeBookingJourney.sourceCity,
          destCity: activeBookingJourney.destCity,
          totalPrice: activeBookingJourney.totalPrice,
          passengers: 1,
          contactName: name,
          contactEmail: email,
          contactPhone: phone,
          journeyType: activeBookingJourney.transportMode,
          legs: activeBookingJourney.legs || []
        };

        const res = await window.api.createBooking(payload);

        closeBookingModal();

        // Refresh search results to show decremented seat count
        if (typeof executeSearch === 'function') {
          executeSearch();
        }

        // Update navbar bookings count
        const badge = document.getElementById('bookingsCountBadge');
        if (badge) {
          const current = parseInt(badge.textContent) || 0;
          badge.textContent = current + 1;
          badge.style.display = 'inline-block';
        }

        const goToBookings = confirm(`✓ Booking Confirmed Successfully!\n\nBooking Reference: ${res.bookingReference || res.bookingId}\nPassenger: ${res.passengerName || res.contactName || name}\nTotal Amount: ₹${formatINR(res.totalAmount || res.totalPrice)}\n\nSeats have been permanently updated in MySQL.\n\nClick OK to view your ticket in "My Bookings", or Cancel to stay on this page.`);
        if (goToBookings) {
          window.location.href = '/bookings.html';
        }
      } catch (err) {
        if (alertBox) {
          alertBox.textContent = err.message || 'Booking failed due to seat unavailability.';
          alertBox.style.display = 'block';
        } else {
          alert('Booking error: ' + (err.message || 'Insufficient capacity.'));
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Booking (Demo)';
        }
      }
    });
  }

  // Auto-load bookings if on bookings.html
  const bookingsListContainer = document.getElementById('myBookingsList');
  if (bookingsListContainer) {
    loadMyBookingsList();
  }
});

let allUserBookings = [];
let activeBookingFilter = 'ALL';

function formatDate(dt) {
  if (!dt) return '--';
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (_) {
    return String(dt);
  }
}

function formatTimeOnly(dt, fallbackTime) {
  if (fallbackTime && typeof fallbackTime === 'string') {
    return fallbackTime.substring(0, 5);
  }
  if (!dt) return '--:--';
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (_) {
    return String(dt);
  }
}

async function loadMyBookingsList() {
  const container = document.getElementById('myBookingsList');
  if (!container) return;

  const user = window.api.getCurrentUser();
  const userGreeting = document.getElementById('currentUserHeader');
  if (userGreeting) {
    if (user && user.fullName) {
      userGreeting.innerHTML = `👤 Logged in as: <strong style="color: #10224D;">${user.fullName}</strong> (${user.email || ''})`;
    } else {
      userGreeting.innerHTML = `👤 Active Session • <a href="/login.html" style="color: #1677FF; text-decoration: none; font-weight: 700;">Sign In</a>`;
    }
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 48px; color: #64748B;">
      <p style="font-size: 15px;">Loading verified bookings from MySQL...</p>
    </div>
  `;

  try {
    const bookings = await window.api.getMyBookings();
    allUserBookings = Array.isArray(bookings) ? bookings : [];

    // Update filter counts
    updateFilterCounts(allUserBookings);

    // Update navbar badge
    const countBadge = document.getElementById('bookingsCountBadge');
    if (countBadge) {
      const activeCount = allUserBookings.filter(b => (b.status || b.bookingStatus) === 'CONFIRMED').length;
      countBadge.textContent = activeCount;
      countBadge.style.display = activeCount > 0 ? 'inline-block' : 'none';
    }

    renderFilteredBookings();
  } catch (err) {
    container.innerHTML = `
      <div class="empty-results-box" style="text-align: center; padding: 40px 20px; background: #FFF; border-radius: 12px; border: 1px solid #FECACA;">
        <h3 style="color: #B91C1C; margin-bottom: 8px;">Could Not Load Bookings</h3>
        <p style="color: #64748B; font-size: 14px; margin-bottom: 16px;">${err.message || 'An error occurred fetching bookings from MySQL.'}</p>
        <button onclick="loadMyBookingsList()" class="btn-secondary" style="font-size: 13px;">Retry</button>
      </div>
    `;
  }
}

function updateFilterCounts(bookings) {
  const total = bookings.length;
  let upcoming = 0;
  let completed = 0;
  let cancelled = 0;

  bookings.forEach(b => {
    const isCancelled = (b.status === 'CANCELLED' || b.bookingStatus === 'CANCELLED');
    if (isCancelled) {
      cancelled++;
    } else {
      const dep = b.departureDateTime ? new Date(b.departureDateTime) : null;
      if (dep && !isNaN(dep.getTime()) && dep < new Date()) {
        completed++;
      } else {
        upcoming++;
      }
    }
  });

  const allEl = document.getElementById('allCount');
  const upEl = document.getElementById('upcomingCount');
  const compEl = document.getElementById('completedCount');
  const canEl = document.getElementById('cancelledCount');
  if (allEl) allEl.textContent = total;
  if (upEl) upEl.textContent = upcoming;
  if (compEl) compEl.textContent = completed;
  if (canEl) canEl.textContent = cancelled;
}

function setBookingFilter(filter) {
  activeBookingFilter = filter;
  document.querySelectorAll('#bookingFilterTabs .mode-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
  });
  renderFilteredBookings();
}

function renderFilteredBookings() {
  const filtered = allUserBookings.filter(b => {
    const isCancelled = (b.status === 'CANCELLED' || b.bookingStatus === 'CANCELLED');
    if (activeBookingFilter === 'CANCELLED') return isCancelled;
    if (activeBookingFilter === 'UPCOMING') {
      if (isCancelled) return false;
      const dep = b.departureDateTime ? new Date(b.departureDateTime) : null;
      return !(dep && !isNaN(dep.getTime()) && dep < new Date());
    }
    if (activeBookingFilter === 'COMPLETED') {
      if (isCancelled) return false;
      const dep = b.departureDateTime ? new Date(b.departureDateTime) : null;
      return (dep && !isNaN(dep.getTime()) && dep < new Date());
    }
    return true; // ALL
  });

  renderBookingsList(filtered);
}

function renderBookingsList(bookings) {
  const container = document.getElementById('myBookingsList');
  if (!container) return;

  if (!bookings || bookings.length === 0) {
    const filterNotice = activeBookingFilter !== 'ALL' ? ` with status "${activeBookingFilter}"` : '';
    container.innerHTML = `
      <div class="empty-results-box" style="text-align: center; padding: 48px 24px; background: #FFF; border-radius: 16px; border: 1px solid #E2E8F0; margin-top: 16px;">
        <i data-lucide="ticket" style="width: 52px; height: 52px; color: #94A3B8; margin: 0 auto 16px;"></i>
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #10224D; margin-bottom: 8px;">No Bookings Found${filterNotice}</h3>
        <p style="color: #64748B; font-size: 14px; max-width: 460px; margin: 0 auto 20px;">
          Search for Indian flights, trains, buses, or hybrid journeys to book tickets stored permanently in MySQL.
        </p>
        <a href="/search.html" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700;">
          <i data-lucide="search" style="width: 16px; height: 16px;"></i> Search Journeys
        </a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = bookings.map(b => {
    const rawRef = b.bookingReference || b.bookingId || ('TS-IN-' + (b.rawId || b.id));
    const formattedRef = rawRef.startsWith('#') ? rawRef : '#' + rawRef;
    const isCancelled = (b.status === 'CANCELLED' || b.bookingStatus === 'CANCELLED');
    const statusPill = isCancelled 
      ? `<span style="background: #FEE2E2; color: #991B1B; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid #FECACA;">CANCELLED</span>`
      : `<span style="background: #ECFDF5; color: #065F46; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; border: 1px solid #A7F3D0;">CONFIRMED</span>`;

    const mode = (b.transportMode || b.journeyType || 'FLIGHT').toUpperCase();
    const modeIcon = mode === 'FLIGHT' ? 'plane' : mode === 'TRAIN' ? 'train' : mode === 'BUS' ? 'bus' : 'layers';
    const operator = b.operatorName || 'TravelSmart Express';
    const serviceNum = b.serviceNumber ? ` • ${b.serviceNumber}` : '';
    const srcCity = b.sourceCity || b.originCity || 'Origin';
    const dstCity = b.destCity || b.destinationCity || 'Destination';

    const depDate = formatDate(b.departureDateTime || b.departureDate || b.travelDate);
    const depTimeOnly = formatTimeOnly(b.departureDateTime, b.departureTime);
    const arrDate = formatDate(b.arrivalDateTime || b.arrivalDate || b.departureDateTime || b.travelDate);
    const arrTimeOnly = formatTimeOnly(b.arrivalDateTime, b.arrivalTime);

    const paxCount = b.passengerCount || b.passengersCount || 1;
    const paxName = b.passengerName || b.contactName || 'Valued Passenger';
    const paxEmail = b.passengerEmail || b.contactEmail || '';
    const paxPhone = b.passengerPhone || b.contactPhone || '';
    const bookingDateFormatted = formatDateTime(b.bookingDate || b.createdAt);
    const targetCancelId = String(b.bookingId || b.bookingReference || b.rawId || b.id);

    const legsHtml = (b.legs && b.legs.length > 0) ? b.legs.map((l, idx) => {
      const legMode = (l.transportType || l.mode || 'LEG').toUpperCase();
      const legIcon = legMode === 'FLIGHT' ? 'plane' : legMode === 'TRAIN' ? 'train' : legMode === 'BUS' ? 'bus' : 'circle-dot';
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #E2E8F0; font-size: 13px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="mode-icon-tag ${legMode}" style="width: 24px; height: 24px; font-size: 11px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px;">
              <i data-lucide="${legIcon}" style="width: 14px; height: 14px;"></i>
            </span>
            <span style="font-weight: 700; color: #10224D;">Leg ${idx + 1}: ${l.originCity || l.sourceCity} → ${l.destinationCity || l.destCity}</span>
            <span style="color: #64748B; margin-left: 4px;">(${l.operatorName || l.carrierName || 'Direct'}${l.serviceNumber || l.carrierCode ? ' • ' + (l.serviceNumber || l.carrierCode) : ''})</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 11.5px; color: #64748B; margin-right: 8px;">${formatTime(l.departureTime)} → ${formatTime(l.arrivalTime)}</span>
            <span style="font-weight: 700; color: #10224D;">₹${formatINR(l.fareAmount || l.price)}</span>
          </div>
        </div>
      `;
    }).join('') : '';

    return `
      <div class="journey-card" style="margin-bottom: 22px;">
        <div class="journey-card-header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div class="mode-icon-tag ${mode}">
              <i data-lucide="${modeIcon}" style="width: 18px; height: 18px;"></i>
            </div>
            <div>
              <div style="font-size: 12px; color: #64748B; font-weight: 600;">Reference: <strong style="color: #10224D;">${formattedRef}</strong></div>
              <div style="font-size: 16.5px; font-weight: 800; color: #10224D; margin-top: 1px;">
                ${srcCity} → ${dstCity}
              </div>
              <div style="font-size: 12px; color: #64748B; margin-top: 2px;">
                ${operator}${serviceNum} • <span style="text-transform: capitalize; font-weight: 600; color: #1677FF;">${mode.toLowerCase()}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
            ${statusPill}
            <div style="font-size: 1.35rem; font-weight: 800; color: #10224D;">₹${formatINR(b.totalAmount || b.totalPrice)}</div>
          </div>
        </div>

        <!-- Schedule Dates & Timings Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; margin: 14px 0;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px;">Departure</div>
            <div style="font-size: 14px; font-weight: 800; color: #10224D;">${depTimeOnly}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px;">📅 ${depDate}</div>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 3px;">Arrival</div>
            <div style="font-size: 14px; font-weight: 800; color: #10224D;">${arrTimeOnly}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 2px;">📅 ${arrDate}</div>
          </div>
        </div>

        <!-- Passenger Details -->
        <div style="margin: 14px 0 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">Passenger & Contact Details</div>
          <div style="font-size: 13px; font-weight: 600; color: #1E293B;">
            ${paxCount} Passenger(s) • <span style="color: #10224D; font-weight: 700;">${paxName}</span> 
            ${paxEmail ? ` • <span style="color: #64748B;">${paxEmail}</span>` : ''} 
            ${paxPhone ? ` • <span style="color: #64748B;">${paxPhone}</span>` : ''}
          </div>
        </div>

        <!-- Multi-leg breakdown (for hybrid journeys) -->
        ${legsHtml ? `
          <div style="margin: 14px 0; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0; padding: 12px 14px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 6px;">Journey Legs & Pricing</div>
            ${legsHtml}
          </div>
        ` : ''}

        <!-- Footer with date booked and cancel action -->
        <div class="journey-card-footer" style="padding-top: 14px; border-top: 1px solid #F1F5F9; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 12px; color: #64748B;">
            Booked on: <b>${bookingDateFormatted}</b>
          </div>
          ${!isCancelled ? `
            <button onclick="handleCancelBooking('${targetCancelId}')" class="btn-secondary" style="color: #DC2626; border-color: #FECACA; background: #FEF2F2; font-weight: 700; font-size: 12.5px; padding: 7px 14px; border-radius: 8px; cursor: pointer;">
              Cancel Booking & Restore Seats
            </button>
          ` : `
            <span style="font-size: 12px; color: #94A3B8; font-style: italic;">Seats released back to inventory</span>
          `}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

async function handleCancelBooking(bookingId) {
  if (!confirm(`Are you sure you want to cancel booking #${bookingId}? Your seats will be atomically restored in MySQL.`)) {
    return;
  }

  try {
    const res = await window.api.cancelBooking(bookingId);
    alert(`✓ Booking #${bookingId} successfully cancelled!\nSeats have been restored in the database.`);
    await loadMyBookingsList();
  } catch (err) {
    alert('Cancellation failed: ' + (err.message || 'Error occurred.'));
  }
}


