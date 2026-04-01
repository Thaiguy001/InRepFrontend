## Frontend for the Incident Response Platform.

Built with:
Vue 3
Vite
Pinia
PrimeVue
OpenAPI-generated TypeScript client

### Prerequisites
Node.js (v18+ recommended)
npm
Backend running locally (InRepBackend)

### Backend Requirement
The backend must be running before starting the frontend.
Backend should be available at:
http://localhost:8000


You can verify it is running by visiting:
http://localhost:8000/openapi.json

If this URL does not load, the frontend API client will not work.

### Environment Setup

Create a .env.local file in the project root:
VITE_API_BASE_URL=http://localhost:8000

Restart the dev server if you change this.

### Install Dependencies

From the InRepFrontend directory:

npm install

Generate API Client

The frontend uses a generated TypeScript client based on the backend OpenAPI spec.

Run:

curl http://localhost:5000/openapi.json -o openapi.json

npm run generate-api

This will:

Download the OpenAPI spec from the backend

Generate typed API client code in:

src/api/generated

You should re-run this whenever backend API schemas change.

### Run the Dev Server
npm run dev

The app will be available at:

http://localhost:5173