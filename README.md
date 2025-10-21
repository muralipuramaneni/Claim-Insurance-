# Insurance Claim System

A modern full-stack insurance claim management system built with Next.js, FastAPI, Supabase, and AI integration using LangGraph.

## 🚀 Features

- **User Authentication**: Secure registration and login with Supabase Auth
- **Role-Based Access**: Customer, Agent, and Admin roles with different permissions
- **Claim Management**: Submit, track, and manage insurance claims
- **AI Processing**: Automated claim analysis using LangGraph workflows
- **Real-time Updates**: Live claim status updates
- **Document Upload**: Support for claim-related document uploads
- **Fraud Detection**: AI-powered fraud detection and risk assessment
- **Modern UI**: Responsive design with TailwindCSS
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **TailwindCSS** - Utility-first CSS framework
- **Supabase Auth** - Authentication and user management

### Backend
- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database and real-time features
- **LangGraph** - AI workflow orchestration
- **Pydantic** - Data validation and serialization

### AI & Analytics
- **LangGraph** - Complex AI workflow management
- **OpenAI** - Natural language processing
- **Custom AI Models** - Fraud detection and claim classification

## 📁 Project Structure

```
insurance-claim-app/
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── lib/                 # Utility functions
│   └── package.json
├── backend/                 # FastAPI application
│   ├── app/                 # Application code
│   │   ├── routers/         # API routes
│   │   ├── models/          # Pydantic models
│   │   └── langgraph/       # AI workflows
│   └── requirements.txt
├── .env.example             # Environment variables template
└── README.md               # This file
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.11+
- **Supabase Account** (free tier available)
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd insurance-claim-app
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and keys
3. Copy the provided SQL schema (see Database Setup section)

### 3. Environment Setup

Copy the environment files and fill in your values:

```bash
# Root environment
cp .env.example .env

# Frontend environment
cp frontend/.env.example frontend/.env.local

# Backend environment
cp backend/.env.example backend/.env
```

**Required Environment Variables:**

```env
# Supabase (get from your Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Optional: AI services
OPENAI_API_KEY=your-openai-api-key
```

### 4. Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('customer', 'agent', 'admin')) DEFAULT 'customer',
    phone TEXT,
    address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table
CREATE TABLE claims (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    claim_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('auto', 'health', 'property', 'life')),
    status TEXT NOT NULL CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'settled')) DEFAULT 'submitted',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    amount DECIMAL(12,2),
    description TEXT NOT NULL,
    incident_date DATE NOT NULL,
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claim_history table
CREATE TABLE claim_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    notes TEXT,
    performed_by UUID REFERENCES profiles(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_processing_logs table
CREATE TABLE ai_processing_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    node_name TEXT NOT NULL,
    input_data JSONB,
    output_data JSONB,
    execution_time INTEGER,
    status TEXT CHECK (status IN ('success', 'error', 'pending')) NOT NULL,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own claims" ON claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own claims" ON claims FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### 6. Run the Application

**Start the backend:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Start the frontend:**
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📚 Usage

### User Registration

1. Navigate to http://localhost:3000/register
2. Fill in your details (Full Name, Email, Password, Role)
3. Click "Create Account"

### Submit a Claim

1. Log in to your account
2. Go to the dashboard
3. Click "Submit New Claim"
4. Fill in claim details and submit

### AI Processing

Claims are automatically processed through AI workflows that:
- Classify claim types
- Validate documents
- Assess risk factors
- Detect fraud indicators
- Generate recommendations

## 🧠 AI Features

### LangGraph Workflows

The system uses LangGraph to orchestrate complex AI workflows:

1. **Claim Classification**: Automatically categorizes claims
2. **Document Validation**: Verifies document completeness
3. **Risk Assessment**: Calculates risk scores
4. **Fraud Detection**: Identifies suspicious patterns
5. **Recommendation Engine**: Suggests next actions

### Available AI Endpoints

- `POST /ai/process-claim/{claim_id}` - Process claim through AI workflow
- `GET /ai/analysis/{claim_id}` - Get AI analysis results
- `POST /ai/classify-document` - Classify uploaded documents
- `GET /ai/fraud-check/{claim_id}` - Run fraud detection

## 🛡️ Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Row-level security (RLS) in database
- **API Security**: CORS configuration and input validation

## 🧪 Testing

**Backend Tests:**
```bash
cd backend
pytest
```

**Frontend Tests:**
```bash
cd frontend
npm test
```

## 📝 API Documentation

Visit http://localhost:8000/docs for interactive API documentation with Swagger UI.

### Key Endpoints

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

**User Management:**
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile

**Claims:**
- `GET /claims` - List user claims
- `POST /claims` - Create new claim
- `GET /claims/{id}` - Get claim details
- `PUT /claims/{id}` - Update claim

## 🔧 Development

### Adding New Features

1. **Frontend**: Create components in `frontend/components/`
2. **Backend**: Add routes in `backend/app/routers/`
3. **AI Workflows**: Extend `backend/app/langgraph/claim_agent.py`

### Database Migrations

Use Supabase dashboard or SQL editor to modify database schema.

### Environment Variables

See `.env.example` files for all available configuration options.

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Backend (Railway/Render)

1. Push code to GitHub
2. Create new service on Railway/Render
3. Connect repository
4. Add environment variables
5. Deploy

### Database (Supabase)

Supabase handles database hosting automatically.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README and API docs
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ User authentication
- ✅ Basic claim management
- ✅ AI processing workflows

### Phase 2 (Planned)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Third-party integrations
- [ ] Enhanced AI models

### Phase 3 (Future)
- [ ] Computer vision for damage assessment
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 📊 Performance

- **Frontend**: Optimized with Next.js static generation
- **Backend**: Async FastAPI with efficient database queries
- **Database**: PostgreSQL with proper indexing
- **AI**: Cached results and batch processing

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangGraph Documentation](https://langgraph-ai.github.io/langgraph/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ using modern web technologies**