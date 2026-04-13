# CampSite — Campground Booking Platform

A full-stack web application that lets tourists browse, book, cancel campsites, and leave ratings. Admins manage the camp catalogue through a dedicated panel.

---

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | React 19 · React Router v7 · Context API · Vite |
| Backend    | ASP.NET 10 · Entity Framework Core · SQL Server |
| Auth       | ASP.NET Identity · JWT Bearer tokens            |
| Validation | FluentValidation (server) + inline (client)     |
| Tests      | xUnit · Moq · FluentAssertions                  |

---

## Prerequisites

| Tool       | Version | Notes                                |
| ---------- | ------- | ------------------------------------ |
| .NET SDK   | 10.0+   | `dotnet --version`                   |
| Node.js    | 20+     | `node --version`                     |
| SQL Server | any     | LocalDB (bundled with VS) works fine |

---

## Getting Started

### 1. Clone / Extract

```bash
# Extract the ZIP into a working directory
cd CampSite
```

### 2. Backend API

```bash
cd CampSite.API

# Restore NuGet packages
dotnet restore

# The database is created & seeded automatically on first run.
# Default connection: (localdb)\MSSQLLocalDB  →  edit appsettings.json to change.

# Start the API (HTTPS on port 7218, HTTP on 5203)
dotnet run --launch-profile https
```

API will be available at **https://localhost:7218**  
Swagger UI: **https://localhost:7218/swagger**

> **Seed credentials**  
> Admin: `admin@campsite.com` / `Admin@123`  
> Demo user: `user@campsite.com` / `User@123`

### 3. Frontend UI

```bash
cd campsite-ui

# Install npm dependencies
npm install

# Start the dev server (port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

The `.env` file is pre-configured:

```
VITE_API_BASE_URL=https://campsite-api-aph2bsd4f4h8hjd4.canadacentral-01.azurewebsites.net
```

---

## Running Unit Tests

```bash
cd CampSite.Tests

dotnet test --verbosity normal
```

Minimum 15 test cases cover:

- Auth service (login, register, JWT generation)
- Booking service (overlapping dates, past check-in, cancellation rules)
- Camp service (paging, capacity filter, CRUD)
- FluentValidation rules (booking, camp create/update)

---

## Project Structure

```
CampSite/
├── campsite-ui/            # React frontend (Vite)
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # AppContext + useApp hook
│       ├── hooks/          # useAuth
│       ├── pages/          # Route-level pages
│       └── services/       # Axios API wrapper
├── CampSite.API/           # ASP.NET Web API
│   ├── Controllers/        # AuthController, CampsController, …
│   ├── Data/               # EF DbContext + SeedData
│   ├── DTOs/               # Request/Response data contracts
│   ├── Helpers/            # AutoMapper profile
│   ├── Middleware/         # Global exception handler
│   ├── Models/             # EF entity models
│   ├── Repositories/       # Data access layer
│   ├── Services/           # Business logic layer
│   └── Validators/         # FluentValidation rules
└── CampSite.Tests/         # xUnit test project
```

---

## Feature Summary

| Feature                          | Status |
| -------------------------------- | ------ |
| Browse camps with date filtering | ✅     |
| Capacity-based filtering         | ✅     |
| Pagination (6 per page)          | ✅     |
| Book a camp (guest + billing)    | ✅     |
| Unique 8-char reference number   | ✅     |
| Confirmation screen              | ✅     |
| Manage booking by reference      | ✅     |
| Cancel future bookings           | ✅     |
| Star rating after stay           | ✅     |
| Average rating on dashboard      | ✅     |
| Admin login                      | ✅     |
| Admin: add / edit / delete camps | ✅     |
| JWT authentication + roles       | ✅     |
| FluentValidation (server-side)   | ✅     |
| Client-side form validation      | ✅     |
| Toast notifications              | ✅     |
| Responsive mobile UI             | ✅     |
| Discount coupons (bonus)         | ✅     |
| Dynamic weekday/weekend pricing  | ✅     |

---

## Assumptions

1. Payment is collected at check-in (out of scope per requirements).
2. A single campsite can only have one active booking for any date range.
3. Admin accounts are created via database seeding only (no self-registration UI for admins).
4. Regular users do not need to create accounts to book — booking is guest-based.
5. Weekend rate applies to Friday, Saturday, and Sunday nights.
6. Ratings can be added or updated after checkout; they cannot be deleted.
7. Cancellation is allowed only for future bookings (check-in date is today or later is NOT cancellable once the day arrives).

---

## Seeded Coupon Codes

| Code     | Discount | Min. Nights |
| -------- | -------- | ----------- |
| CAMP10   | $10 off  | 1           |
| CAMP25   | $25 off  | 2           |
| SUMMER50 | $50 off  | 3           |

---

## Changing the Database Connection

Edit `CampSite.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=CampSiteDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

The application runs `dotnet ef database migrate` automatically at startup.

---

## Building for Production

```bash
# Frontend production build
cd campsite-ui
npm run build
# Output in campsite-ui/dist/

# Backend release build
cd CampSite.API
dotnet publish -c Release -o ./publish
```
