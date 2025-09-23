import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockProperties } from "@/data/mockData";
import { ArrowLeft, MapPin, Star, Calendar, Users, Wifi, Car, Utensils, Waves, Phone, Mail } from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const property = mockProperties.find(p => p.id === id);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [specialRequests, setSpecialRequests] = useState("");

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Button asChild>
            <Link to="/properties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      "WiFi": Wifi,
      "Parking": Car,
      "Restaurant": Utensils,
      "Kitchen": Utensils,
      "Pool": Waves,
      "Ocean View": Waves,
    };
    const Icon = icons[amenity] || Star;
    return <Icon className="w-5 h-5" />;
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * property.pricePerNight : 0;
  };

  const nights = calculateTotal() / property.pricePerNight || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/properties" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Properties
              </Link>
            </Button>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/user/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/user/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={property.images[0]}
                alt={property.name}
                className="w-full h-80 object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-white/90 text-primary">
                {property.type}
              </Badge>
            </div>

            {/* Property Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">${property.pricePerNight}</div>
                  <div className="text-sm text-muted-foreground">per night</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.8 (124 reviews)</span>
              </div>

              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>What this place offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card>
              <CardHeader>
                <CardTitle>Meet your host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {property.owner.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{property.owner.name}</h3>
                    <p className="text-muted-foreground">Property Owner</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{property.owner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reserve</span>
                  <Badge variant={property.availabilityStatus === "available" ? "default" : "destructive"}>
                    {property.availabilityStatus}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="checkin">Check-in</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">Check-out</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="10"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea
                    id="requests"
                    placeholder="Any special requests or requirements..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                {checkIn && checkOut && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                      <span>${property.pricePerNight} × {nights} nights</span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service fee</span>
                      <span>${Math.round(calculateTotal() * 0.05)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>${calculateTotal() + Math.round(calculateTotal() * 0.05)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-primary hover:bg-primary-hover"
                  disabled={property.availabilityStatus !== "available" || !checkIn || !checkOut}
                  asChild
                >
                  <Link to={`/booking/confirm/${property.id}?checkin=${checkIn}&checkout=${checkOut}&guests=${guests}`}>
                    {property.availabilityStatus === "available" ? "Reserve Now" : "Not Available"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}