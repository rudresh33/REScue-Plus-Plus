# REScue++ — Post-Disaster Civilian Safety & Response Tracker

**Course:** IMC-502 — Programming in C++  
**Submission Date:** 31 October 2025

## Team Members
- 2330 — Rudresh Achari  
- 2309 — Sanika Hoble  
- 2321 — Sarvadhnya Patil

---

## Abstract
Natural disasters such as earthquakes, floods, and industrial accidents create chaotic conditions that delay response and complicate survivor and resource tracking. REScue++ is a C++-based simulation system to register and track survivors, manage relief resources, and support emergency responders in organizing rescue operations efficiently. The system applies structured programming paradigms including object-oriented design, the C++ Standard Library (STL), file handling, and exception management to ensure robust and maintainable code.

## Project Architecture
REScue++ integrates a high-performance C++ backend with a Node.js server using Node-Addon-API to expose native functionality to JavaScript.

- Backend (C++): Core simulation logic (triage, resource allocation, shelter management).
- Bridge: Node Addon (backend/cpp/addon/) compiles C++ code into a module callable from Node.js.
- Server: Node.js server manages API routes and serves the dashboard.
- Frontend: Lightweight HTML/CSS/JS dashboard for visualizing survivors, resources, and shelter status.

## Key Features
1. Survivor Management — register survivors with details (age, gender, location) and categorize status (Critical, Moderate, Safe).
2. Emergency Triage — priority queue-based triage to sort survivors by medical urgency.
3. Resource Allocation — tracks and distributes food, water, medical kits, blankets and other supplies based on demand.
4. Shelter Management — assigns survivors to shelters and monitors occupancy to prevent overcrowding.
5. Reporting & Analytics — exports summaries of survivors found, resources used, and shelter statuses for post-simulation analysis.

## Technical Implementation
Core C++ classes and responsibilities:
- Civilian & DatabaseManager: handle survivor records and persistence.
- TriageSystem: uses std::priority_queue for urgency-based ordering.
- Shelter & ShelterManager: manage shelter capacities and assignments.
- Resource & ResourceManager: inventory tracking using std::map.
- ReportGenerator: exportable simulation data (CSV/JSON).

The C++ backend is exposed to the Node.js server via a Node-Addon-API bridge so the server and dashboard can run simulations and retrieve results in real time.

## Installation & Setup

### Prerequisites
- C++ compiler (GCC/Clang/MSVC)
- Node.js v18+ and npm

### Build & Run
1. Clone the repository:
   git clone https://github.com/YourUsername/REScue-Plus-Plus.git
   cd REScue-Plus-Plus

2. Install Node dependencies:
   npm install

3. Build the C++ addon:
   npm run build
   (or) node-gyp rebuild

4. Start the server:
   node server/server.js

5. Open the dashboard:
   http://localhost:3000 (or the port shown in the console)

## Future Work
- Integrate IoT devices (drones / wearables) for real-time survivor telemetry.
- Add AI-driven resource allocation to predict needs using population density and historical data.
- Move to cloud-based infrastructure for multi-agency collaboration and horizontal scalability.

---

## Notes & TODOs
- The original draft included inline citation tokens. These were removed and the README now uses a single "Notes & TODOs" area. If you need a full bibliography, add a References section with formatted citations or provide the citation list and I will integrate it.
- Replace the repository URL and npm scripts (if different) with actual values from your repo.
- Consider adding a CONTRIBUTING.md and LICENSE file.

## Acknowledgements
Inspired by various post-disaster case studies and analyses referred to in the project report.
