# backend/db/connection.py

from sqlalchemy import create_engine, text
from config.settings import DATABASE_URL

# Create SQLAlchemy engine
# Set pool_pre_ping to avoid stale connection errors
engine = None

# Auto-initialize on import
try:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        pool_recycle=3600,
    )
    # Test the connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection successful")
except Exception as e:
    print(f"⚠️  Database will be initialized on first use: {e}")
    engine = None

def initialize_db():
    """Initialize database connection."""
    global engine
    try:
        engine = create_engine(
            DATABASE_URL,
            echo=False,          # set True only for debugging
            future=True,
            pool_pre_ping=True,  # Test connections before using them
            pool_size=5,
            max_overflow=10,
            pool_recycle=3600,   # Recycle connections every hour
        )
        # Test the connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database Connection Error: {e}")
        print(f"DATABASE_URL: {DATABASE_URL}")
        engine = None
        return False

def get_engine():
    """Get the database engine, initializing if needed."""
    global engine
    if engine is None:
        initialize_db()
    return engine

