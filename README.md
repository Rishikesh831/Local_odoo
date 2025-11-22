# StockMaster Backend

FastAPI + PostgreSQL backend for offline-first inventory management system.

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Create PostgreSQL Database
```bash
createdb stockmaster
```

Or using psql:
```sql
CREATE DATABASE stockmaster;
```

### 3. Setup Alembic (Database Migrations)
```bash
alembic init alembic
alembic revision --autogenerate -m "init"
alembic upgrade head
```

### 4. Run the Server
```bash
uvicorn app.main:app --reload
```

Server runs on: http://localhost:8000
Swagger UI: http://localhost:8000/docs

## API Endpoints

### Users
- `POST /users/` - Create user
- `GET /users/{user_id}` - Get user by ID
- `GET /users/` - List all users
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Products
- `POST /products/` - Create product
- `GET /products/{product_id}` - Get product by ID
- `GET /products/` - List all products
- `PUT /products/{product_id}` - Update product
- `DELETE /products/{product_id}` - Soft delete product

### Operations
- `POST /operations/` - Create operation
- `GET /operations/{operation_id}` - Get operation by ID
- `GET /operations/` - List all operations
- `PUT /operations/{operation_id}` - Update operation
- `DELETE /operations/{operation_id}` - Delete operation

### Stock Moves
- `POST /stock-moves/` - Create stock move (updates product stock)
- `GET /stock-moves/{stock_move_id}` - Get stock move by ID
- `GET /stock-moves/` - List all stock moves
- `PUT /stock-moves/{stock_move_id}` - Update stock move
- `DELETE /stock-moves/{stock_move_id}` - Delete stock move

### Sync (Offline-First)
- `POST /sync/push` - Push offline-generated data
- `GET /sync/pull?since=timestamp` - Pull updated data

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app & routes
│   ├── config.py            # Configuration & settings
│   ├── database.py          # Database setup
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── operation.py
│   │   └── stock_move.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── operation.py
│   │   └── stock_move.py
│   ├── routers/             # Route handlers
│   │   ├── users.py
│   │   ├── products.py
│   │   ├── operations.py
│   │   ├── stock_moves.py
│   │   └── sync.py
│   └── utils/               # Utility functions
│       ├── auth.py
│       ├── uuid_gen.py
│       └── stock_update.py
├── alembic/                 # Database migrations
├── alembic.ini
├── requirements.txt
├── .env
└── README.md
```

## Database Schema

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `hashed_password` (VARCHAR) - Bcrypt hashed password
- `role` (ENUM) - staff, manager, or admin
- `created_at` (TIMESTAMP)

### Products Table
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Product name
- `sku` (VARCHAR) - Unique stock keeping unit
- `category` (VARCHAR) - Product category
- `min_stock_level` (INT) - Minimum stock alert
- `current_stock` (INT) - Current quantity
- `last_updated` (TIMESTAMP) - Last modification
- `is_deleted` (BOOLEAN) - Soft delete flag

### Operations Table
- `id` (UUID) - Primary key
- `reference_code` (VARCHAR) - Operation reference
- `type` (ENUM) - receipt, delivery, internal, adjustment
- `status` (ENUM) - draft, done, synced
- `created_by` (UUID) - User reference
- `created_at` (TIMESTAMP)
- `last_updated` (TIMESTAMP)

### Stock Moves Table
- `id` (UUID) - Primary key
- `operation_id` (UUID) - Operation reference
- `product_id` (UUID) - Product reference
- `quantity` (INT) - Quantity moved
- `location_source` (VARCHAR) - Source location
- `location_dest` (VARCHAR) - Destination location
- `created_at` (TIMESTAMP)

## Key Features

✅ UUID primary keys for offline-first sync
✅ SQLAlchemy 2.0 with async support ready
✅ Pydantic v2 validation
✅ Password hashing with bcrypt
✅ Automatic stock level updates
✅ Soft deletes for products
✅ CORS enabled for frontend
✅ Sync endpoints for offline-first applications
✅ Full CRUD operations
✅ PostgreSQL with proper constraints

## Environment Variables

See `.env` file:
- `POSTGRES_HOST` - Database host (default: localhost)
- `POSTGRES_PORT` - Database port (default: 5432)
- `POSTGRES_DB` - Database name (default: stockmaster)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)

## Testing

Example user creation:
```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "role": "staff"
  }'
```

Example product creation:
```bash
curl -X POST "http://localhost:8000/products/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Widget A",
    "sku": "WGT-001",
    "category": "Electronics",
    "min_stock_level": 10
  }'
```

## Requirements

- Python 3.10+
- PostgreSQL 12+
- FastAPI 0.115.0
- SQLAlchemy 2.0.36
- Uvicorn 0.30.0

## License

MIT
