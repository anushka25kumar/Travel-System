# TravelSmart – Integrated Multimodal Transportation Management System

**TravelSmart** is a modern full-stack travel booking application prototype that unifies three core transportation modes:
1. **Flights** (Air corridors)
2. **Trains** (High-Speed & Regional Rail)
3. **Buses** (Express Coaches)

And introduces the flagship innovation: **Choose Your Own Hybrid Journey**, where travelers can manually design custom multi-leg journeys, select transport modes and intermediate waypoints, and have our **Java 21 Spring Boot** engine compute connection safety, layovers, ticket costs, and carbon footprints with interactive **Leaflet** OpenStreetMap visualization.

---

## 1. Technology Stack

### Backend
- **Language**: Java 21 (OpenJDK 21)
- **Framework**: Spring Boot 3.3.4
- **ORM / Persistence**: Spring Data JPA with Hibernate
- **Security**: Spring Security (stateless REST CORS & CSRF filter chain)
- **Database**: MySQL 8.0+ (with seamless H2 in-memory profile fallback)
- **Build Tool**: Apache Maven 3.10.0

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS (strict color palette matching reference design)
- **Icons**: Lucide React
- **Maps**: Leaflet with OpenStreetMap (color-coded mode polylines & hubs)
- **Analytics / Charts**: Recharts (Mode Comparison Bar & Radar charts)
- **Forms**: React Hook Form with field validation
- **API Client**: Axios

---

## 2. Layered Architecture

```
travelsmart/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/travelsmart/
│       │   ├── TravelSmartApplication.java
│       │   ├── config/DataInitializer.java
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── BookingController.java
│       │   │   ├── BusController.java
│       │   │   ├── FlightController.java
│       │   │   ├── HybridJourneyController.java
│       │   │   ├── LocationController.java
│       │   │   ├── SearchController.java
│       │   │   └── TrainController.java
│       │   ├── dto/
│       │   │   ├── AuthRequest.java / AuthResponse.java
│       │   │   ├── BookingRequest.java / BookingResponseDTO.java
│       │   │   ├── CustomHybridRequest.java / CustomLegInputDTO.java
│       │   │   ├── CustomHybridValidationResultDTO.java
│       │   │   ├── JourneyLegDTO.java / JourneyOptionDTO.java
│       │   │   └── SearchRequest.java
│       │   ├── entity/
│       │   │   ├── Booking.java
│       │   │   ├── BookingLeg.java
│       │   │   ├── HybridJourney.java
│       │   │   ├── HybridJourneyLeg.java
│       │   │   ├── Payment.java
│       │   │   ├── Route.java
│       │   │   ├── Schedule.java
│       │   │   ├── Transport.java
│       │   │   └── User.java
│       │   ├── exception/GlobalExceptionHandler.java
│       │   ├── repository/
│       │   │   ├── BookingRepository.java
│       │   │   ├── HybridJourneyRepository.java
│       │   │   ├── RouteRepository.java
│       │   │   ├── ScheduleRepository.java
│       │   │   ├── TransportRepository.java
│       │   │   └── UserRepository.java
│       │   ├── security/SecurityConfig.java
│       │   └── service/
│       │       ├── BookingService.java
│       │       ├── HybridJourneyService.java
│       │       ├── JourneyRecommendationService.java
│       │       ├── SearchService.java
│       │       ├── TransferValidationService.java
│       │       └── TransportService.java
│       └── resources/
│           ├── application.properties        # MySQL connection
│           └── application-h2.properties     # Fallback test profile
├── database/
│   ├── schema.sql                           # Full MySQL relational schema
│   └── seed.sql                             # Comprehensive seed data
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
## 2. Layered Architecture & Integration Model

```
travelsmart/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/travelsmart/
│       │   ├── TravelSmartApplication.java
│       │   ├── config/DataInitializer.java      # 95+ Indian airports, IRCTC rail & express bus lines
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── BookingController.java
│       │   │   ├── BusController.java
│       │   │   ├── FlightController.java
│       │   │   ├── HybridJourneyController.java
│       │   │   ├── LocationController.java
│       │   │   ├── SearchController.java        # Live multimodal search & offer revalidation
│       │   │   └── TrainController.java
│       │   ├── dto/
│       │   │   ├── DataSourceType.java           # LIVE, CACHED, DEMO, UNAVAILABLE
│       │   │   ├── LiveSearchResponseDTO.java    # Search response with provider transparency
│       │   │   ├── SearchStatusDTO.java          # Aggregator status & query metadata
│       │   │   ├── OfferRevalidationRequest.java / OfferRevalidationResultDTO.java
│       │   │   ├── ProviderStatusDTO.java        # Status for all transport providers
│       │   │   ├── CustomHybridRequest.java / CustomLegInputDTO.java
│       │   │   ├── CustomHybridValidationResultDTO.java
│       │   │   ├── JourneyLegDTO.java / JourneyOptionDTO.java
│       │   │   └── SearchRequest.java
│       │   ├── entity/
│       │   │   ├── TransportProvider.java        # External API configurations
│       │   │   ├── TransportStop.java            # Multi-terminal airports, stations, ISBTs
│       │   │   ├── TransportService.java         # Master flight/train/bus records
│       │   │   ├── ServiceSchedule.java          # Timetables and departure days
│       │   │   ├── FareSnapshot.java             # Cached fare and seat availability
│       │   │   ├── ApiSyncLog.java               # API call audit and sync latency logs
│       │   │   ├── Booking.java / BookingLeg.java
│       │   │   ├── HybridJourney.java / HybridJourneyLeg.java
│       │   │   └── User.java
│       │   ├── provider/
│       │   │   ├── FlightDataProvider.java / AmadeusFlightDataProvider.java / DemoFlightDataProvider.java
│       │   │   ├── TrainDataProvider.java / IrctcTrainDataProvider.java / VerifiedTimetableTrainDataProvider.java
│       │   │   ├── BusDataProvider.java / RedBusDataProvider.java / VerifiedBusDataProvider.java
│       │   │   └── TransportProviderManager.java # Parallel non-blocking orchestration
│       │   ├── repository/                       # 13 Spring Data JPA repositories
│       │   ├── security/SecurityConfig.java
│       │   └── service/
│       │       ├── LocationResolverService.java  # City -> IATA airport / IRCTC junction / ISBT terminal
│       │       ├── SearchService.java            # Multi-provider aggregator (fixes "No Journeys Found")
│       │       ├── TransferValidationService.java # Cross-terminal transfer feasibility & safety
│       │       ├── BookingService.java
│       │       └── HybridJourneyService.java
│       └── resources/
│           ├── application.properties            # MySQL connection & provider credentials
│           └── application-h2.properties         # Zero-config in-memory H2 profile
├── database/
│   ├── schema.sql                               # Relational tables 1 to 16
│   └── seed.sql                                 # Comprehensive Indian route & schedule seed
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                              # Search banner, refresh, filter resets, state handling
        ├── components/
        │   ├── Navbar.jsx
        │   ├── HeroSearch.jsx                   # Date, passengers, Indian cities
        │   ├── QuickFilterBar.jsx
        │   ├── JourneyCard.jsx                  # Data source badges (LIVE, CACHED, DEMO, UNAVAILABLE)
        │   ├── RouteMap.jsx                     # Leaflet route visualization
        │   ├── HybridJourneyBuilder.jsx         # Custom multi-leg journey builder
        │   ├── ModeComparisonCharts.jsx         # Time, price, CO2 comparison
        │   ├── BookingModal.jsx                 # Live offer revalidation before payment
        │   └── MyBookings.jsx
        └── services/api.js

---

## 3. How to Run Locally

### Prerequisites
- Java 21 (`java -version`)
- Maven (`mvn -version`)
- Node.js 18+ & npm (`node -v`, `npm -v`)
- MySQL 8.0+ (Optional: if not configured, H2 profile runs seamlessly out of the box)

---

### Step 1: Environment Configuration (Optional for Live External APIs)

Copy `.env.example` to `.env` or set environment variables:

```bash
# Amadeus Flight Offers API v2 (https://developers.amadeus.com)
export AMADEUS_CLIENT_ID="your_amadeus_api_key"
export AMADEUS_CLIENT_SECRET="your_amadeus_api_secret"
export AMADEUS_ENVIRONMENT="test" # test or production

# Indian Railways (IRCTC) Timetable / Partner Gateway
export TRAIN_API_BASE_URL="https://api.railway-partner.in/v1"
export TRAIN_API_KEY="your_partner_api_key"

# redBus / Intercity Bus Inventory Gateway
export BUS_API_BASE_URL="https://api.redbus-partner.in/v1"
export BUS_API_KEY="your_bus_api_key"
```

> **Zero-Credential Resilience**: If no external API keys are supplied, TravelSmart automatically engages its high-fidelity verified timetable engines (Indian Railways, Verified Express Coaches, and Verified Flight Timetables), cleanly tagging results as `DEMO` or `CACHED` so searches like **Chandigarh → New Delhi** always return rich results without 500 errors.

---

### Step 2: Set Up Database (MySQL or H2)

```bash
# Option A: MySQL (configured in application.properties)
mysql -u root -p travelsmart_db < database/schema.sql

# Option B: Use H2 In-Memory mode (zero setup needed)
# All 95 Indian airports and multimodal transit routes will automatically seed.
```

---

### Step 3: Run the Java Spring Boot Backend

In a terminal:

```bash
cd backend

# Run with MySQL:
mvn spring-boot:run

# Or run with H2 In-Memory profile:
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

The backend server will run on: `http://localhost:8080`

---

### Step 4: Run the React Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on: `http://localhost:5173`

---

## 4. Key Endpoints & Testing

### 1. Live Multimodal Aggregation Search
`GET /api/search/live?source=Chandigarh&destination=New Delhi&date=2026-10-25`

Returns unified flights (IXC → DEL), trains (CDG → NDLS Vande Bharat/Shatabdi), and buses (ISBT 43 → Kashmere Gate ISBT) with provider metadata and data source tags.

### 2. Location & Terminal Resolver
`GET /api/locations/search?query=Chandigarh`

Returns mapped railway stations (`CDG`), bus terminals (`ISBT Sector 43`, `ISBT Sector 17`), and airports (`IXC`).

### 3. Provider Gateway Status
`GET /api/providers/status`

Returns connection health and last sync timestamps for Amadeus, IRCTC, and redBus gateways.

### 4. Real-Time Offer Revalidation
`POST /api/offers/revalidate`

```json
{
  "offerId": "FL-IN-DEMO-1",
  "providerName": "Amadeus Flight Offers v2",
  "expectedPrice": 5450,
  "currency": "INR",
  "travelDate": "2026-10-25",
  "source": "Chandigarh",
  "destination": "New Delhi"
}
```

### 5. Automated Tests
```bash
cd backend
mvn test
```
Runs the 7 full integration tests in `TravelSmartLiveIntegrationTest.java` verifying multi-terminal resolution, Amadeus fallback resilience, provider health checks, and cross-terminal transfer constraints.
