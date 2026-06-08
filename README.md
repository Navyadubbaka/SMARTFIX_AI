# SMARTFIX MiniProject


SMARTFIX is a full-stack maintenance complaint system that lets users submit issue reports with images and gets AI-based category prediction. The backend is built with Node.js, Express, and MongoDB, while the frontend is a React app. An optional Python Flask model service analyzes uploaded photos to classify issues like plumbing, electrical, or carpentry. The project also includes GitHub Actions CI for backend install and frontend build validation.

- `backend/` - Node.js + Express API
- `frontend/frontend/` - React app created with Create React App
- `ai-model/` - Python Flask service for image classification

## Project structure

- `backend/`
  - `server.js` - Express server
  - `routes/` - API routes
  - `controllers/` - request handlers
  - `models/` - Mongoose schemas
  - `config/multer.js` - file upload configuration
- `frontend/frontend/`
  - React app source in `src/`
  - `package.json` for frontend dependencies and build scripts
- `ai-model/`
  - `app.py` - Flask image classification API
  - `model.h5` - trained TensorFlow model

## Local setup

### 1. Backend

```bash
cd backend
npm install
node server.js
```

The backend runs on `http://localhost:5000` by default.

### 2. Frontend

```bash
cd frontend/frontend
npm install
npm start
```

The React app runs on `http://localhost:3000`.

### 3. AI model service (optional)

```bash
cd ai-model
pip install flask pillow numpy tensorflow
python app.py
```

The model service listens on `http://localhost:8000` and is used by the backend for image prediction.

## Notes

- The backend saves uploaded images to `backend/uploads/`.
- The frontend posts complaint data as `FormData` to `backend/api/complaints/create`.
- If GitHub Actions CI is enabled, the workflow validates backend install and frontend build.

## GitHub Actions

A workflow file is configured in `.github/workflows/ci.yml` to:

- install backend dependencies
- install frontend dependencies
- build the React frontend

## Troubleshooting

- If port `5000` is busy, stop the existing backend process or run the backend on another port:
  ```bash
  set PORT=5001 && node server.js
  ```
- If image uploads fail, make sure `backend/uploads/` exists and the AI model service is running.

