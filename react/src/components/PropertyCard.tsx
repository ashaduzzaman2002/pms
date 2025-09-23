import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Users, Calendar, DollarSign, Edit, Eye } from "lucide-react";

export interface Property {
  id: string;
  name: string;
  type: "villa" | "hotel" | "flat";
  location: string;
  address: string;
  description: string;
  amenities: string[];
  pricePerNight: number;
  images: string[];
  availabilityStatus: "available" | "booked" | "maintenance";
  owner: {
    name: string;
    email: string;
  };
}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onView?: (property: Property) => void;
}

export function PropertyCard({ property, onEdit, onView }: PropertyCardProps) {
  const getStatusBadge = (status: Property["availabilityStatus"]) => {
    const variants = {
      available: "bg-success text-success-foreground",
      booked: "bg-warning text-warning-foreground",
      maintenance: "bg-destructive text-destructive-foreground",
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: Property["type"]) => {
    const icons = {
      villa: "🏡",
      hotel: "🏨",
      flat: "🏠",
    };
    return icons[type];
  };

  return (
    <Card className="group transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={property.images[0]}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            {getStatusBadge(property.availabilityStatus)}
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
            <span className="text-lg">{getTypeIcon(property.type)}</span>
          </div>
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="flex items-center gap-1 text-sm font-semibold">
              <DollarSign className="h-3 w-3" />
              {property.pricePerNight}/night
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{property.name}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <MapPin className="h-3 w-3" />
              {property.location}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>Owner: {property.owner.name}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(property)}
        >
          <Eye className="h-3 w-3 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onEdit?.(property)}
        >
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}