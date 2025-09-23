import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, Building2, DollarSign, Calendar } from "lucide-react";
import apiService from "@/services/api";

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ownersData, propertiesData] = await Promise.all([
        apiService.getUsers({ role: 'owner' }),
        apiService.getProperties()
      ]);
      setOwners(ownersData);
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOwnerStats = (ownerId) => {
    const ownerProperties = properties.filter(p => p.owner === ownerId);
    const totalRevenue = ownerProperties.reduce((sum, p) => sum + (p.price * 30), 0); // Estimate monthly
    return {
      propertyCount: ownerProperties.length,
      totalRevenue
    };
  };

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Property Owners</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Property Owners</h1>
        <Badge variant="outline">{filteredOwners.length} owners</Badge>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search owners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOwners.map((owner) => {
          const stats = getOwnerStats(owner._id);
          return (
            <Card key={owner._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{owner.name}</h3>
                      <Badge variant={owner.isActive ? "default" : "secondary"}>
                        {owner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{owner.email}</span>
                  </div>
                  {owner.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{owner.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(owner.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.propertyCount}</div>
                    <div className="text-xs text-blue-600">Properties</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="text-2xl font-bold text-green-700">${stats.totalRevenue.toLocaleString()}</div>
                    <div className="text-xs text-green-600">Est. Monthly</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Properties
                  </Button>
                  <Button variant="outline" size="sm">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOwners.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No owners found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "No property owners registered yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Owners;
