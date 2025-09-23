import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, DollarSign, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
import { PropertyModal } from "@/components/PropertyModal";
import apiService from "@/services/api";

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await apiService.getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProperty(null);
    setModalOpen(true);
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);
    setModalOpen(true);
  };

  const handleDelete = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await apiService.deleteProperty(propertyId);
        setProperties(properties.filter(p => p._id !== propertyId));
      } catch (error: any) {
        alert(error.message || 'Failed to delete property');
      }
    }
  };

  const handleSave = (savedProperty: any) => {
    if (editingProperty) {
      setProperties(properties.map(p => 
        p._id === savedProperty._id ? savedProperty : p
      ));
    } else {
      setProperties([...properties, savedProperty]);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Properties</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
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
        <h1 className="text-3xl font-bold">Properties</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Badge variant="outline" className="text-sm">
          {filteredProperties.length} properties
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 relative overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <img
                  src={`http://localhost:5000${property.images[0]}`}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100"></div>
              )}
              <div className="absolute top-4 left-4">
                <Badge className="bg-white/90 text-slate-900">
                  ${property.price}/night
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant={property.isActive ? "default" : "secondary"}>
                  {property.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {property.images && property.images.length > 1 && (
                <div className="absolute bottom-4 right-4">
                  <Badge className="bg-black/70 text-white">
                    +{property.images.length - 1} more
                  </Badge>
                </div>
              )}
            </div>
            
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
              
              <div className="flex items-center gap-1 text-gray-600 mb-3">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{property.location}</span>
              </div>

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
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 3).map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(property)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(property._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first property"}
            </p>
            {!searchTerm && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <PropertyModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        property={editingProperty}
      />
    </div>
  );
};

export default Properties;
