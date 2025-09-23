import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Wifi, Car, Utensils, Waves, Building2, Users } from "lucide-react";
import apiService from "@/services/api";

export default function PublicPropertyListing() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await apiService.getProperties({ isActive: true });
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = priceRange === "all" || 
      (priceRange === "budget" && property.price < 200) ||
      (priceRange === "mid" && property.price >= 200 && property.price <= 400) ||
      (priceRange === "luxury" && property.price > 400);
    return matchesSearch && matchesPrice && property.isActive;
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                <Input
                  placeholder="Where do you want to go?"
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property._id} className="group hover:shadow-card transition-all duration-300 overflow-hidden">
                  <div className="relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={import.meta.env.VITE_IMAGE_URL+property.images[0]}
                        alt={property.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100"></div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 text-primary px-2 py-1 rounded text-sm font-medium">
                      ${property.price}/night
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
                    
                    {property.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {property.description}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{property.bedrooms || 0} bed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{property.bathrooms || 0} bath</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{property.maxGuests || 0} guests</span>
                      </div>
                    </div>
                    
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded">
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{property.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <Button asChild className="w-full bg-gradient-primary hover:bg-primary-hover">
                      <Link to={`/property/${property._id}`}>
                        View Details & Book
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                No properties found matching your criteria.
              </div>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
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