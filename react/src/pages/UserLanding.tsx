import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Star, Users, Shield, Clock, Award } from "lucide-react";
import { Link } from "react-router-dom";
import apiService from "@/services/api";

const UserLanding = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await apiService.getProperties();
        setProperties(data.slice(0, 3)); // Show only first 3 properties
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const stats = [
    { label: "Properties", value: "500+", icon: MapPin },
    { label: "Happy Guests", value: "10K+", icon: Users },
    { label: "Cities", value: "50+", icon: Award },
    { label: "Years Experience", value: "15+", icon: Clock }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              ✨ Premium Property Rentals
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Dream Stay
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Discover handpicked luxury properties in the world's most beautiful destinations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/user/booking">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto font-semibold shadow-xl">
                  Start Booking
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 h-auto font-semibold">
                View Properties
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">Why Choose Us</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Premium Experience Guaranteed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We provide exceptional service and carefully curated properties for unforgettable stays
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Instant Booking</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">Book instantly with real-time availability and immediate confirmation for peace of mind</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">Verified Properties</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">All properties are personally inspected and verified for quality, safety, and authenticity</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900">24/7 Concierge</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 leading-relaxed">Premium support team available around the clock for any assistance you need</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">Featured Collection</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Handpicked Properties
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover our most popular and highly-rated properties chosen by our expert team
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-xl animate-pulse">
                  <div className="h-64 bg-slate-200"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-slate-200 rounded mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 w-20 bg-slate-200 rounded"></div>
                      <div className="h-10 w-24 bg-slate-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {properties.map((property) => (
                <Card key={property._id} className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
                  <div className="h-64 relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={`http://localhost:5000${property.images[0]}`}
                        alt={property.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <Badge className="absolute top-4 left-4 bg-white/90 text-slate-900 hover:bg-white">
                      Featured
                    </Badge>
                    {property.images && property.images.length > 1 && (
                      <div className="absolute bottom-4 right-4">
                        <Badge className="bg-black/70 text-white">
                          +{property.images.length - 1} photos
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {property.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-slate-700">{property.rating || 4.8}</span>
                        <span className="text-slate-500 text-sm">(124)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{property.location}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {property.amenities?.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-3xl font-bold text-slate-900">${property.price}</span>
                        <span className="text-slate-600 ml-1">/night</span>
                      </div>
                      <Link to={`/user/property/${property._id}`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied guests who have found their perfect stay with us
          </p>
          <Link to="/user/booking">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto font-semibold shadow-xl">
              Book Your Stay Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default UserLanding;
