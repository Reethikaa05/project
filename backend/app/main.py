from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base, SessionLocal
from app.api import auth, datasets, analytics
from app.db.models import User, Dataset, DatasetRow
from app.core.security import get_password_hash

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed default demo user if no user exists
        demo_user = db.query(User).filter(User.email == "demo@databoard.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@databoard.com",
                hashed_password=get_password_hash("password123")
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

        # Seed sample dataset if no dataset exists
        sample_ds = db.query(Dataset).first()
        if not sample_ds:
            cols_meta = [
                {"name": "Region", "data_type": "categorical"},
                {"name": "Quarter", "data_type": "categorical"},
                {"name": "Sales_USD", "data_type": "numeric"},
                {"name": "Profit_USD", "data_type": "numeric"},
            ]
            sample_ds = Dataset(
                user_id=demo_user.id,
                name="tech_sales_2025.csv",
                original_filename="tech_sales_2025.csv",
                row_count=10,
                column_count=4,
                columns_metadata=cols_meta
            )
            db.add(sample_ds)
            db.commit()
            db.refresh(sample_ds)

            rows_data = [
                {"Region": "North America", "Quarter": "Q1", "Sales_USD": 150000, "Profit_USD": 45000},
                {"Region": "North America", "Quarter": "Q2", "Sales_USD": 180000, "Profit_USD": 54000},
                {"Region": "Europe", "Quarter": "Q1", "Sales_USD": 120000, "Profit_USD": 36000},
                {"Region": "Europe", "Quarter": "Q2", "Sales_USD": 140000, "Profit_USD": 42000},
                {"Region": "Asia Pacific", "Quarter": "Q1", "Sales_USD": 200000, "Profit_USD": 70000},
                {"Region": "Asia Pacific", "Quarter": "Q2", "Sales_USD": 230000, "Profit_USD": 80000},
                {"Region": "Latin America", "Quarter": "Q1", "Sales_USD": 90000, "Profit_USD": 22000},
                {"Region": "Latin America", "Quarter": "Q2", "Sales_USD": 110000, "Profit_USD": 28000},
                {"Region": "Middle East", "Quarter": "Q1", "Sales_USD": 95000, "Profit_USD": 25000},
                {"Region": "Middle East", "Quarter": "Q2", "Sales_USD": 105000, "Profit_USD": 29000},
            ]

            for idx, r in enumerate(rows_data):
                db.add(DatasetRow(dataset_id=sample_ds.id, row_index=idx, row_data=r))
            
            db.commit()
    except Exception as e:
        print("Seed data exception:", e)
        db.rollback()
    finally:
        db.close()

seed_initial_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DataBoard - Full-stack Data Upload, Analytics & ECharts Visualization Web Application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://project-eight-sand-34.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to DataBoard API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
