# Property Management System

A comprehensive property management system with dynamic APIs, advanced authentication, and real-time features.

## 🚀 Features

### Enhanced API System
- **Dynamic API Configuration**: Environment-based configuration with automatic failover
- **Request/Response Interceptors**: Automatic token refresh, error handling, and request transformation
- **Intelligent Caching**: Configurable caching with TTL and cache invalidation
- **Retry Logic**: Automatic retry with exponential backoff for failed requests
- **File Upload**: Progress tracking and chunked uploads for large files
- **Batch Operations**: Execute multiple API calls efficiently
- **Real-time Updates**: WebSocket integration for live data updates

### Advanced Authentication
- **JWT with Refresh Tokens**: Secure authentication with automatic token refresh
- **Role-based Access Control**: Fine-grained permissions system
- **Protected Routes**: Component-level route protection
- **Session Management**: Persistent sessions with "Remember Me" functionality
- **Password Security**: Forgot/reset password functionality
- **Multi-factor Authentication**: Ready for MFA integration

### User Experience
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Notifications**: Toast notifications for user feedback
- **Offline Support**: Service worker for offline functionality
- **Progressive Web App**: PWA capabilities for mobile experience

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/
│   ├── auth/                 # Authentication components
│   ├── properties/           # Property management components
│   ├── ui/                   # Reusable UI components
│   └── ProtectedRoute.jsx    # Route protection
├── contexts/
│   ├── AuthContext.jsx       # Authentication state management
│   └── NotificationContext.jsx # Notification system
├── hooks/
│   └── useApi.js            # Custom API hooks
├── services/
│   └── api.js               # Enhanced API service
└── pages/                   # Page components
```

### Backend Structure
```
backend/
├── models/                  # Database models
├── routes/                  # API routes
├── middleware/              # Authentication & validation
└── uploads/                 # File storage
```

## 🔧 API Service Features

### Basic Usage
```javascript
import apiService from './services/api';

// GET request with caching
const properties = await apiService.get('/properties', { location: 'NYC' });

// POST request with automatic cache invalidation
const newProperty = await apiService.post('/properties', propertyData);

// File upload with progress tracking
await apiService.uploadFile('/properties/images', file, {
  onProgress: (percent) => console.log(`Upload: ${percent}%`)
});
```

### Custom Hooks
```javascript
import { useProperties, useCreateProperty } from './hooks/useApi';

function PropertyManager() {
  const { data: properties, loading, error, refetch } = useProperties();
  const createProperty = useCreateProperty({
    onSuccess: () => refetch()
  });

  return (
    // Component JSX
  );
}
```

### Authentication Integration
```javascript
import { useAuth } from './contexts/AuthContext';

function Dashboard() {
  const { 
    user, 
    isAuthenticated, 
    hasPermission, 
    canAccess 
  } = useAuth();

  if (!canAccess('dashboard', 'read')) {
    return <AccessDenied />;
  }

  return <DashboardContent />;
}
```

## 🔐 Authentication System

### Role-based Access Control
```javascript
// Protect entire routes
<AdminRoute>
  <UserManagement />
</AdminRoute>

// Conditional rendering
<PermissionGate roles={['admin', 'owner']}>
  <DeleteButton />
</PermissionGate>

// Programmatic checks
if (hasPermission('properties:delete')) {
  // Show delete option
}
```

### Token Management
- Automatic token refresh before expiration
- Secure storage with httpOnly cookies option
- Token validation and cleanup
- Multi-tab synchronization

## 📡 Real-time Features

### WebSocket Integration
```javascript
// Automatic WebSocket connection for authenticated users
const { data, isConnected } = useRealTimeApi('/notifications', [], {
  wsEventTypes: ['notification:new', 'notification:read'],
  onRealtimeUpdate: (data, type) => {
    // Handle real-time updates
  }
});
```

### Live Updates
- Property availability changes
- Booking status updates
- Maintenance request notifications
- System-wide announcements

## 🎨 UI/UX Features

### Error Handling
```javascript
<ErrorBoundary fallback={CustomErrorComponent}>
  <App />
</ErrorBoundary>
```

### Notifications
```javascript
const { success, error, warning, info } = useNotification();

// Show success message
success('Property created successfully');

// Show error with details
error('Failed to save property', {
  title: 'Validation Error',
  persistent: true
});
```

### Loading States
```javascript
<LoadingSpinner 
  size="lg" 
  text="Loading properties..." 
  overlay={true} 
/>
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd property-management
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../react
npm install
```

4. **Environment Setup**

Backend (.env):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/property-management
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_ENVIRONMENT=development
```

5. **Start the application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd react
npm start
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Property Endpoints
- `GET /api/properties` - List properties with filters
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/search` - Search properties

### Booking Endpoints
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/status` - Update booking status

### File Upload
- `POST /api/files/upload` - Upload files
- `DELETE /api/files/:id` - Delete file

## 🔧 Configuration

### API Service Configuration
```javascript
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};
```

### Cache Configuration
```javascript
// Default cache timeout: 5 minutes
// Custom cache per request:
const data = await apiService.get('/properties', {}, {
  cache: true,
  cacheTtl: 10 * 60 * 1000 // 10 minutes
});
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd react
npm test
```

### Test Coverage
- Unit tests for API service
- Integration tests for authentication
- Component tests for UI elements
- E2E tests for critical user flows

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd react
npm run build

# Start production server
cd ../backend
npm start
```

### Environment Variables
Ensure all production environment variables are set:
- Database connection strings
- JWT secrets
- API URLs
- File storage configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 🔄 Changelog

### v2.0.0 (Latest)
- ✨ Enhanced API service with interceptors and caching
- 🔐 Advanced authentication with refresh tokens
- 🎨 Improved UI/UX with error boundaries and notifications
- 📡 Real-time updates with WebSocket integration
- 🚀 Performance optimizations and lazy loading
- 🧪 Comprehensive testing suite

### v1.0.0
- 🏠 Basic property management functionality
- 👥 User authentication and authorization
- 📅 Booking system
- 🧹 Housekeeping management
- 🔧 Maintenance tracking
