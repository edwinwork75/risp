# **MC2 Monorepo - Developer Guide**

## **📌 Overview**
MC2 is a **multi-tenant SaaS boilerplate** designed to manage organisations, users, roles, permissions, and projects. It consists of:
- **Backend** (Node.js, Express, Prisma, PostgreSQL)
- **Frontend** (Vite, React, shadcn/ui)

This monorepo supports **dynamic APIs**, **role-based access control (RBAC)**, and **multi-tenancy**, and is structured to ensure smooth development and deployment using **Docker**, **Prisma**, and **ViteJS**.

---

## **📂 Folder Structure**
```
managementconsole/
│── backend/                   # Backend Service (Express, Prisma)
│   ├── prisma/                # Prisma ORM schema and migrations
│   │   ├── schema/            # Schema files split for modularity
│   │   ├── migrations/        # Database migration files
│   ├── src/                   # Backend application code
│   │   ├── controllers/       # Express route handlers
│   │   ├── middleware/        # Authentication & RBAC middleware
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic & database interactions
│   │   ├── index.ts           # Application entry point
│   ├── package.json           # Backend dependencies and scripts
│   ├── Dockerfile             # Docker setup for backend
│── frontend/                  # Frontend Service (Vite, React)
│   ├── src/                   # React application code
│   │   ├── components/        # UI components
│   │   ├── pages/             # Page-level components
│   │   ├── api/               # API service calls
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies and scripts
│   ├── Dockerfile             # Docker setup for frontend
│── prisma/                    # Shared Prisma schema
│   ├── schema/                # Prisma schema split into multiple files
│   ├── migrations/            # Database migration files
│── docker-compose.yml         # Docker services for backend, frontend, and PostgreSQL
│── package.json               # Root monorepo package.json with workspaces
│── .env.example               # Sample environment variables
│── README.md                  # Developer guide
```

---

## **🚀 Getting Started**

### **1️⃣ Prerequisites**
Ensure you have the following installed:
- **Node.js** (v20+ recommended)
- **npm** (v10+ recommended)
- **Docker & Docker Compose**
- **PostgreSQL** (if running locally without Docker)

### **2️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/mc2-monorepo.git
cd mc2-monorepo
```

### **3️⃣ Install Dependencies**
```sh
npm install
```
This will install dependencies for both **backend** and **frontend**.

---

## **🛠 Running the Application**

### **Running Locally**
#### **1. Set up environment variables**
Copy `.env.example` to `.env` and configure values for **backend and database**.
```sh
cp .env.example .env
```

#### **2. Set up Database**
Run **Prisma migrations** to create the required tables.
```sh
npm run generate --workspace=backend
npm run migrate --workspace=backend
npm run seed --workspace=backend
```

#### **3. Start Backend & Frontend**
```sh
npm run dev
```
This will run:
- Backend on `http://localhost:5001`
- Frontend on `http://localhost:3000`

---

### **Running with Docker**
```sh
docker-compose up --build -d
```
- **Backend** → `http://localhost:5001`
- **Frontend** → `http://localhost:3000`
- **PostgreSQL** → `localhost:5432`

To view logs:
```sh
docker-compose logs -f backend
docker-compose logs -f frontend
```

To stop the containers:
```sh
docker-compose down
```

---

## **🔐 Authentication & Role-Based Access Control (RBAC)**

### **📌 System Roles**
1. **SuperUser** - System-wide access, can manage all organisations.
2. **OrgUser** - Assigned to an organisation, limited to its resources.

### **📌 Permissions**
- Users are assigned **roles**.
- **Roles** have a set of **permissions** that control access.

Example:
| Role         | Permissions                      |
|-------------|---------------------------------|
| SuperUser   | Manage Users, Organisations, Settings |
| OrgAdmin    | Manage Users, Roles, Projects in Org |
| OrgMember   | Limited access to projects & data |

---

## **📡 API Endpoints**
### **Authentication**
| Method | Endpoint               | Description            | Auth Required |
|--------|------------------------|------------------------|--------------|
| POST   | `/api/auth/login`      | Login with email/password | No |
| POST   | `/api/auth/register`   | Register a new user | No |

### **Users**
| Method | Endpoint             | Description             | Auth Required |
|--------|----------------------|-------------------------|--------------|
| GET    | `/api/users`         | List all users         | ✅ |
| GET    | `/api/users/:id`     | Get user details       | ✅ |
| POST   | `/api/users`         | Create a new user      | ✅ |
| PATCH  | `/api/users/:id`     | Update user details    | ✅ |
| DELETE | `/api/users/:id`     | Delete a user          | ✅ |

---

## **📌 Dynamic APIs**
The **Dynamic API system** allows **CRUD operations** on any database model dynamically.

### **📌 Dynamic API Routes**
| Method  | Endpoint                  | Description                                      |
|---------|---------------------------|--------------------------------------------------|
| GET     | `/d/{model}`               | Retrieve all records for a model                |
| GET     | `/d/{model}/{id}`          | Retrieve a record by ID                         |
| POST    | `/d/{model}`               | Create a new record                             |
| PATCH   | `/d/{model}/{id}`          | Update a record by ID                           |
| DELETE  | `/d/{model}/{id}`          | Delete a record by ID                           |
| GET     | `/d/{model}/o/{orgId}`     | Get records within an organisation             |
| POST    | `/d/{model}/o/{orgId}`     | Create a record within an organisation         |
| GET     | `/d/{model}/o/{orgId}/p/{projId}` | Get records within an organisation & project |
| POST    | `/d/{model}/o/{orgId}/p/{projId}` | Create a record within an organisation & project |

### **📌 Example Usage**
```sh
curl -X GET http://localhost:5001/d/user -H "Authorization: Bearer YOUR_TOKEN"
```

---

## **🛠 Adding a New Model**
1. Define a new model in **Prisma** (`prisma/schema/`):
   ```prisma
   model Example {
     id        String  @id @default(uuid())
     name      String
     createdAt DateTime @default(now())
   }
   ```
2. Run Prisma migration:
   ```sh
   npm run migrate --workspace=backend
   ```
3. The **Dynamic API** will automatically allow CRUD operations on this model.

---

## **📌 Frontend Development**
### **1️⃣ Running Frontend Locally**
```sh
cd frontend
npm install
npm run dev
```
The frontend will be available at:  
🔗 **`http://localhost:3000`**

### **2️⃣ Building for Production**
```sh
npm run build
```
This will generate static assets in the `dist/` folder.

### **3️⃣ Environment Variables**
Modify `.env` in the **frontend** directory:
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## **🔍 Debugging & Troubleshooting**
### **Backend Debugging**
- Use logs:
  ```sh
  docker-compose logs -f backend
  ```
- Check database connection:
  ```sh
  docker exec -it mc2-postgres psql -U mc2user -d mc2_dev
  ```

### **Frontend Debugging**
- Check logs in the browser console (F12 → Console).
- Check network requests in the Network tab (F12 → Network).

---

🚀 **MC2 is now fully set up and ready for development!**