import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, CreditCard, Download, MessageCircle } from "lucide-react";
import apiService from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserMyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const data = await apiService.getBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return "✓";
      case "pending": return "⏳";
      case "completed": return "🏆";
      case "cancelled": return "✕";
      default: return "•";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    return nights;
  };

  const upcomingBookings = bookings.filter(b => b.status === "confirmed" || b.status === "pending");
  const pastBookings = bookings.filter(b => b.status === "completed");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">My Bookings</h1>
            <p className="text-xl text-slate-600">Loading your bookings...</p>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-0 shadow-xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">My Account</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">My Bookings</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Manage your reservations and view your booking history
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Upcoming</p>
                  <p className="text-3xl font-bold">{upcomingBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{pastBookings.length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Total Spent</p>
                  <p className="text-3xl font-bold">${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-600" />
              Upcoming Stays
            </h2>
            <div className="space-y-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking._id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-4 gap-0">
                      {/* Property Image */}
                      <div className="md:col-span-1 h-48 md:h-auto bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden rounded-l-lg">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        <Badge className={`absolute top-4 left-4 ${getStatusColor(booking.status)} font-semibold`}>
                          {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {/* Booking Details */}
                      <div className="md:col-span-2 p-6">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{booking.property.name}</h3>
                        <div className="flex items-center gap-2 text-slate-600 mb-4">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">{booking.property.location}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Check-in</div>
                              <div>{formatDate(booking.checkIn)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Check-out</div>
                              <div>{formatDate(booking.checkOut)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Users className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Guests</div>
                              <div>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4" />
                            <div>
                              <div className="font-medium">Duration</div>
                              <div>{calculateNights(booking.checkIn, booking.checkOut)} nights</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions & Price */}
                      <div className="md:col-span-1 p-6 bg-slate-50 flex flex-col justify-between">
                        <div className="text-right mb-4">
                          <div className="text-3xl font-bold text-slate-900">${booking.totalAmount.toLocaleString()}</div>
                          <div className="text-slate-600 text-sm">Total amount</div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Contact Host
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Users className="h-8 w-8 text-slate-600" />
              Past Stays
            </h2>
            <div className="space-y-6">
              {pastBookings.map((booking) => (
                <Card key={booking._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900">{booking.property.name}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)} {booking.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span className="font-medium">{booking.property.location}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {booking.guests} guests
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {calculateNights(booking.checkIn, booking.checkOut)} nights
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <div className="text-2xl font-bold text-slate-900">${booking.totalAmount.toLocaleString()}</div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Receipt
                          </Button>
                          <Button variant="outline" size="sm">
                            Book Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <Card className="border-0 shadow-xl text-center py-16">
            <CardContent>
              <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No bookings yet</h3>
              <p className="text-slate-600 mb-6">Start exploring amazing properties for your next stay</p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Browse Properties
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserMyBookings;
