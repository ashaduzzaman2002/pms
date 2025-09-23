import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Phone, Mail, MessageCircle } from "lucide-react";

// Mock user bookings data
const mockUserBookings = [
  {
    id: "ub1",
    propertyId: "1",
    propertyName: "Luxury Mediterranean Villa",
    propertyImage: "/src/assets/villa-hero.jpg",
    location: "Santorini, Greece",
    checkIn: "2024-02-15",
    checkOut: "2024-02-20",
    guests: 4,
    totalAmount: 2625,
    status: "confirmed",
    bookingDate: "2024-01-10",
    bookingCode: "BK-123456"
  },
  {
    id: "ub2",
    propertyId: "3",
    propertyName: "Modern City Apartment",
    propertyImage: "/src/assets/flat-sample.jpg",
    location: "London, UK",
    checkIn: "2024-03-10",
    checkOut: "2024-03-15",
    guests: 2,
    totalAmount: 1045,
    status: "confirmed",
    bookingDate: "2024-01-15",
    bookingCode: "BK-789012"
  },
  {
    id: "ub3",
    propertyId: "2",
    propertyName: "Grand Metropolitan Hotel",
    propertyImage: "/src/assets/hotel-sample.jpg",
    location: "New York, USA",
    checkIn: "2024-01-05",
    checkOut: "2024-01-08",
    guests: 2,
    totalAmount: 1200,
    status: "completed",
    bookingDate: "2023-12-20",
    bookingCode: "BK-345678"
  }
];

export default function UserBookings() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingBookings = mockUserBookings.filter(booking => 
    booking.status === "confirmed" && new Date(booking.checkIn) > new Date()
  );
  
  const pastBookings = mockUserBookings.filter(booking => 
    booking.status === "completed" || new Date(booking.checkOut) < new Date()
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: "Confirmed", variant: "default" as const },
      completed: { label: "Completed", variant: "secondary" as const },
      cancelled: { label: "Cancelled", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.confirmed;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const BookingCard = ({ booking }: { booking: typeof mockUserBookings[0] }) => (
    <Card className="hover:shadow-card transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <img
            src={booking.propertyImage}
            alt={booking.propertyName}
            className="w-24 h-24 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{booking.propertyName}</h3>
                <div className="flex items-center gap-1 text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{booking.location}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Booking Code: {booking.bookingCode}
                </div>
              </div>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Check-in</div>
                  <div className="text-muted-foreground">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Check-out</div>
                  <div className="text-muted-foreground">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Guests</div>
                  <div className="text-muted-foreground">{booking.guests}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="text-lg font-bold">${booking.totalAmount}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Contact Host
                </Button>
                <Button size="sm" asChild>
                  <Link to={`/property/${booking.propertyId}`}>
                    View Property
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/properties" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PropManager
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/user/profile">Profile</Link>
              </Button>
              <Button variant="ghost">Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              Manage your reservations and view booking history
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastBookings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground mb-4">
                      No upcoming bookings found
                    </div>
                    <Button asChild>
                      <Link to="/properties">Book Your Next Stay</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground mb-4">
                      No past bookings found
                    </div>
                    <Button asChild>
                      <Link to="/properties">Start Your Journey</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Support
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Us
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Live Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}