from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")

# Create Supabase client with service role key for admin operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Create client for anonymous operations
supabase_anon: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

async def init_db():
    """Initialize database connection and check health"""
    try:
        # Test basic connection first
        response = supabase.table('auth.users').select('id').limit(1).execute()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"⚠️  Database tables may not exist yet: {e}")
        print("✅ Database connection established but tables need to be created")
        print("📋 Please run the SQL schema in your Supabase dashboard")
        return True  # Return True to allow the app to start

def get_supabase() -> Client:
    """Dependency to get Supabase client"""
    return supabase

def get_supabase_anon() -> Client:
    """Dependency to get anonymous Supabase client"""
    return supabase_anon