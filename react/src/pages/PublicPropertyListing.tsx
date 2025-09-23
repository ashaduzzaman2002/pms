import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockProperties } from "@/data/mockData";
import { Search, MapPin, Star, Wifi, Car, Utensils, Waves } from "lucide-react";

export default function PublicPropertyListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || property.type === filterType;
    const matchesPrice = priceRange === "all" || 
      (priceRange === "budget" && property.pricePerNight < 200) ||
      (priceRange === "mid" && property.pricePerNight >= 200 && property.pricePerNight <= 400) ||
      (priceRange === "luxury" && property.pricePerNight > 400);
    return matchesSearch && matchesType && matchesPrice && property.availabilityStatus === "available";
  });

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
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PropManager
            </Link>
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

      {/* Hero Search Section */}
      <section className="bg-gradient-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl opacity-90">
              Discover amazing villas, hotels, and apartments worldwide
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                <Input
                  placeholder="Where do you want to go?"
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="flat">Apartment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">Under $200</SelectItem>
                  <SelectItem value="mid">$200 - $400</SelectItem>
                  <SelectItem value="luxury">$400+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Available Properties</h2>
            <p className="text-muted-foreground">{filteredProperties.length} properties found</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="group hover:shadow-card transition-all duration-300 overflow-hidden">
                <div className="relative overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-primary">
                    {property.type}
                  </Badge>
                  <div className="absolute top-3 right-3 bg-white/90 text-primary px-2 py-1 rounded text-sm font-medium">
                    ${property.pricePerNight}/night
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {property.name}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {property.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.amenities.slice(0, 4).map((amenity, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {property.amenities.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{property.amenities.length - 4} more</span>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full bg-gradient-primary hover:bg-primary-hover">
                    <Link to={`/property/${property.id}`}>
                      View Details & Book
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No properties found matching your criteria.
              </div>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setPriceRange("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}