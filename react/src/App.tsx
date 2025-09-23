import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AdminRoute } from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Lazy load components for better performance
const Dashboard = React.lazy(() => import("./pages/Index"));
const Properties = React.lazy(() => import("./pages/Properties"));
const Bookings = React.lazy(() => import("./pages/Bookings"));
const Tenants = React.lazy(() => import("./pages/Tenants"));
const Owners = React.lazy(() => import("./pages/Owners"));
const Housekeeping = React.lazy(() => import("./pages/Housekeeping"));
const Maintenance = React.lazy(() => import("./pages/Maintenance"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("./pages/Settings"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const PublicPropertyListing = React.lazy(() => import("./pages/PublicPropertyListing"));
const PropertyDetail = React.lazy(() => import("./pages/PropertyDetail"));
const UserLogin = React.lazy(() => import("./pages/UserLogin"));
const UserRegister = React.lazy(() => import("./pages/UserRegister"));
const UserBookings = React.lazy(() => import("./pages/UserBookings"));
const BookingConfirm = React.lazy(() => import("./pages/BookingConfirm"));

// Enhanced Query Client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

// Error fallback component
const ErrorFallback = (error, errorInfo, retry) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Application Error
      </h1>
      <p className="text-gray-600 mb-6">
        Something went wrong. Please try refreshing the page or contact support.
      </p>
      <div className="space-y-3">
        <button
          onClick={retry}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary fallback={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider position="top-right" maxNotifications={5}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicPropertyListing />} />
                  <Route path="/properties" element={<PublicPropertyListing />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/user/login" element={<UserLogin />} />
                  <Route path="/admin/login" element={<UserLogin />} />
                  <Route path="/user/register" element={<UserRegister />} />
                  
                  {/* Protected User Routes */}
                  <Route 
                    path="/user/bookings" 
                    element={
                      <ProtectedRoute>
                        <UserBookings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/booking/confirm/:id" 
                    element={
                      <ProtectedRoute>
                        <BookingConfirm />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Admin Portal Routes - Protected */}
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <AppLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/properties" element={<Properties />} />
                            <Route path="/bookings" element={<Bookings />} />
                            <Route path="/tenants" element={<Tenants />} />
                            <Route path="/owners" element={<Owners />} />
                            <Route path="/housekeeping" element={<Housekeeping />} />
                            <Route path="/maintenance" element={<Maintenance />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/settings" element={<Settings />} />
                          </Routes>
                        </Suspense>
                      </AppLayout>
                    </AdminRoute>
                  } />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
