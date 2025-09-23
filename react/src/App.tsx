import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Index";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Tenants from "./pages/Tenants";
import Owners from "./pages/Owners";
import Housekeeping from "./pages/Housekeeping";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PublicPropertyListing from "./pages/PublicPropertyListing";
import PropertyDetail from "./pages/PropertyDetail";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import UserBookings from "./pages/UserBookings";
import BookingConfirm from "./pages/BookingConfirm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicPropertyListing />} />
          <Route path="/properties" element={<PublicPropertyListing />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/bookings" element={<UserBookings />} />
          <Route path="/booking/confirm/:id" element={<BookingConfirm />} />
            
            {/* Admin Portal Routes - Protected */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AppLayout>
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
                </AppLayout>
              </AdminRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
