from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import router

app = FastAPI(
    title="NAVIPORT Machine Learning Maritime API",
    description="Machine Learning-Based Port Congestion Classification and Vessel Waiting Time Prediction System",
    version="1.0.0"
)

# Enable CORS for frontend Vite/React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def read_root():
    return {
        "system": "NAVIPORT Machine Learning Platform",
        "status": "operational",
        "documentation": "/docs",
        "api_prefix": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
