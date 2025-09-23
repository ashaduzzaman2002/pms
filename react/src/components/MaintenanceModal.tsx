import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import apiService from "@/services/api";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: any) => void;
  request?: any;
}

export const MaintenanceModal = ({ isOpen, onClose, onSave, request }: MaintenanceModalProps) => {
  const [formData, setFormData] = useState({
    property: "",
    issue: "",
    description: "",
    priority: "medium",
    estimatedCost: "",
    scheduledDate: ""
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
    }
  }, [isOpen]);

  useEffect(() => {
    if (request) {
      setFormData({
        property: request.property?._id || "",
        issue: request.issue || "",
        description: request.description || "",
        priority: request.priority || "medium",
        estimatedCost: request.estimatedCost?.toString() || "",
        scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : ""
      });
    } else {
      setFormData({
        property: "",
        issue: "",
        description: "",
        priority: "medium",
        estimatedCost: "",
        scheduledDate: ""
      });
    }
  }, [request, isOpen]);

  const fetchProperties = async () => {
    try {
      const data = await apiService.getProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : 0,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null
      };

      let result;
      if (request) {
        result = await apiService.updateMaintenanceRequest(request._id, requestData);
      } else {
        result = await apiService.createMaintenanceRequest(requestData);
      }

      onSave(result);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to save request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{request ? "Edit Request" : "Create Maintenance Request"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="property">Property</Label>
            <Select value={formData.property} onValueChange={(value) => setFormData({ ...formData, property: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property._id} value={property._id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="issue">Issue</Label>
            <Input
              id="issue"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="e.g., AC Not Working"
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
            <Input
              id="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the issue..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
