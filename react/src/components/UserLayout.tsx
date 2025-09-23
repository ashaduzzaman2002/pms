import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Calendar, User, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout = ({ children }: UserLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PropertyStay
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Home
            </Link>
            <Link to="/user/booking" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Book Stay
            </Link>
            {isAuthenticated && (
              <Link to="/user/my-bookings" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                My Bookings
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Admin Panel
              </Link>
            )}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-600">Welcome, {user?.name}</span>
                <Button variant="ghost" className="text-slate-600" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-600">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-2">
            <Link to="/" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/user/booking" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
              Book Stay
            </Link>
            {isAuthenticated && (
              <Link to="/user/my-bookings" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                My Bookings
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="block py-2 text-slate-600 hover:text-slate-900" onClick={() => setMobileMenuOpen(false)}>
                Admin Panel
              </Link>
            )}
            <div className="pt-2 space-y-2">
              {isAuthenticated ? (
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out ({user?.name})
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded">
                  <Home className="w-4 h-4 text-white m-1" />
                </div>
                <span className="font-bold text-lg">PropertyStay</span>
              </div>
              <p className="text-slate-400">Your perfect stay awaits</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-slate-400">
                <Link to="/" className="block hover:text-white transition-colors">Home</Link>
                <Link to="/user/booking" className="block hover:text-white transition-colors">Book Now</Link>
                {isAuthenticated && (
                  <Link to="/user/my-bookings" className="block hover:text-white transition-colors">My Bookings</Link>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#" className="block hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <div className="space-y-2 text-slate-400">
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 PropertyStay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
