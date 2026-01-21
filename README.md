# E-Waste Management Platform

A complete, production-ready E-Waste Management Platform with QR-based digital wallet system, role-based access control, and a clean green-white municipal UI theme.

## 🌟 Features

### Core Concept
- **QR-Based Digital Wallet**: Each citizen has a unique QR code for seamless transactions
- **Municipality Integration**: Add wallet value when e-waste is submitted
- **Water Plant Integration**: Deduct wallet value for water services
- **Super Admin Control**: Complete platform oversight and management

### User Roles & Permissions

#### 1️⃣ USER (Citizen)
- Register/Login with secure authentication
- Auto-generated unique QR code
- View wallet balance and transaction history
- Track e-waste submissions
- Download/display QR code

#### 2️⃣ MUNICIPALITY OFFICER
- Scan user QR codes
- Select e-waste type & quantity
- Add wallet credits
- View collection statistics
- Cannot deduct wallet value

#### 3️⃣ WATER PLANT OFFICER
- Scan user QR codes
- Deduct wallet balance for services
- View service usage history
- Cannot add wallet value

#### 4️⃣ SUPER ADMIN
- Full platform access
- Create/manage all users & roles
- Freeze/unfreeze wallets
- View all transactions
- Platform analytics dashboard

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** Authentication with Refresh Tokens
- **Bcrypt** for password hashing
- **QR Code** generation
- **Role-Based Access Control (RBAC)**

### Frontend
- **React.js** (Vite)
- **Tailwind CSS** (Municipal Green Theme)
- **React Router** for navigation
- **Axios** for API calls
- **QR Code** scanner & generator
- **Recharts** for analytics
- **date-fns** for date formatting

## 📁 Project Structure

```
EwasteManagement/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── municipalityController.js
│   │   ├── waterplantController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   ├── Transaction.js
│   │   ├── EWaste.js
│   │   └── QR.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── municipalityRoutes.js
│   │   ├── waterplantRoutes.js
│   │   └── adminRoutes.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── user/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Wallet.jsx
    │   │   │   ├── Transactions.jsx
    │   │   │   └── Ewaste.jsx
    │   │   ├── municipality/
    │   │   │   └── Dashboard.jsx
    │   │   ├── waterplant/
    │   │   │   └── Dashboard.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── Users.jsx
    │   │       └── Transactions.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your configuration
```

4. Start MongoDB (if not running):
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. Seed admin user:
```bash
npm run seed
```

6. Start backend server:
```bash
# Development
npm run dev

# Production
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔐 Default Credentials

### Admin Account
- **Email**: admin@ewaste.gov
- **Password**: Admin@123456

**⚠️ IMPORTANT**: Change the default password after first login!

## 📊 Database Models

### User
- name, email, phone, password
- role (user | municipality | waterplant | admin)
- status (active | inactive | suspended)
- qrToken (unique for users)

### Wallet
- userId, balance, frozen
- totalCredits, totalDebits
- lastTransactionAt

### Transaction
- walletId, userId, type (credit | debit)
- amount, balanceBefore, balanceAfter
- performedBy, performedByRole
- description, category, metadata
- **Immutable** - cannot be modified after creation

### EWaste
- category, quantity, unit
- valuePerUnit, totalValue
- submittedBy, verifiedBy
- condition, status, notes

### QR
- token (unique), userId
- active, scanCount
- lastScannedAt, lastScannedBy

## 🎨 UI Theme

### Color Palette
- **Primary Green**: #16A34A
- **Accent Green**: #22C55E
- **Light Green**: #DCFCE7
- **Dark Green**: #14532D
- **White**: #FFFFFF
- **Off White**: #F9FAFB

### Design Principles
- Government-grade professional appearance
- Eco-friendly green theme
- Trustworthy and accessible
- Clean, minimal, and modern

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Role-based access control (RBAC)
- Atomic wallet transactions
- Immutable transaction history
- Request rate limiting
- Helmet.js security headers
- CORS protection

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### User
- `GET /api/user/dashboard` - User dashboard data
- `GET /api/user/wallet` - Wallet details
- `GET /api/user/transactions` - Transaction history
- `GET /api/user/ewaste` - E-waste submissions
- `GET /api/user/qr` - QR code

### Municipality
- `POST /api/municipality/scan-qr` - Scan user QR
- `POST /api/municipality/add-credit` - Add wallet credit
- `GET /api/municipality/stats` - Statistics
- `GET /api/municipality/pricing` - E-waste pricing

### Water Plant
- `POST /api/waterplant/scan-qr` - Scan user QR
- `POST /api/waterplant/deduct` - Deduct from wallet
- `GET /api/waterplant/stats` - Statistics

### Admin
- `GET /api/admin/dashboard` - Platform analytics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/wallets/:userId/freeze` - Freeze/unfreeze wallet
- `POST /api/admin/wallets/:userId/adjust` - Adjust wallet balance
- `GET /api/admin/transactions` - All transactions

## 🧪 Testing

### Test User Registration
1. Go to `/register`
2. Fill in user details
3. Auto-generated QR code will be created
4. Wallet initialized with ₹0 balance

### Test Municipality Flow
1. Login as municipality officer
2. Scan user QR code
3. Select e-waste category and quantity
4. Credit added to user wallet
5. Transaction recorded

### Test Water Plant Flow
1. Login as water plant officer
2. Scan user QR code
3. Enter service amount
4. Amount deducted from wallet
5. Transaction recorded

## 📈 E-Waste Pricing

Default pricing (configurable):
- Mobile Phones: ₹50/piece
- Laptops: ₹200/piece
- Computers: ₹150/piece
- Tablets: ₹80/piece
- Televisions: ₹100/piece
- Refrigerators: ₹300/piece
- Washing Machines: ₹250/piece
- Air Conditioners: ₹350/piece
- Batteries: ₹10/kg
- And more...

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in .env
2. Update MongoDB connection string
3. Change all default secrets
4. Deploy to your hosting service (Heroku, AWS, DigitalOcean, etc.)

### Frontend Deployment
1. Build production bundle:
```bash
npm run build
```

2. Deploy `dist` folder to hosting service (Vercel, Netlify, etc.)

3. Update API URL in production

## 📝 Best Practices

1. **Security**
   - Change all default passwords
   - Use strong JWT secrets
   - Enable HTTPS in production
   - Regular security audits

2. **Database**
   - Regular backups
   - Index optimization
   - Monitor performance

3. **Code Quality**
   - Follow ESLint rules
   - Write meaningful commit messages
   - Document complex logic

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - feel free to use for your projects

## 👨‍💻 Developer

Built with ❤️ by AK Multivision

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@akmultivision.com

---

**Made with 🌱 for a greener future**
