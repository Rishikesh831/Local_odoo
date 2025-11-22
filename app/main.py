from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import users, products, operations, stock_moves, sync

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StockMaster API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(products.router)
app.include_router(operations.router)
app.include_router(stock_moves.router)
app.include_router(sync.router)


@app.get("/", tags=["root"])
def read_root():
    """API health check."""
    return {"message": "StockMaster API is running"}


@app.get("/health", tags=["health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
