import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import apiService from "@/services/api";

interface HousekeepingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  task?: any;
}

export const HousekeepingModal = ({ isOpen, onClose, onSave, task }: HousekeepingModalProps) => {
  const [formData, setFormData] = useState({
    property: "",
    room: "",
    task: "",
    description: "",
    priority: "medium",
    scheduledDate: ""
  });
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        property: task.property?._id || "",
        room: task.room || "",
        task: task.task || "",
        description: task.description || "",
        priority: task.priority || "medium",
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate).toISOString().split('T')[0] : ""
      });
    } else {
      setFormData({
        property: "",
        room: "",
        task: "",
        description: "",
        priority: "medium",
        scheduledDate: ""
      });
    }
  }, [task, isOpen]);

  const fetchData = async () => {
    try {
      const [propertiesData, usersData] = await Promise.all([
        apiService.getProperties(),
        apiService.getUsers()
      ]);
      setProperties(propertiesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null
      };

      let result;
      if (task) {
        result = await apiService.updateHousekeepingTask(task._id, taskData);
      } else {
        result = await apiService.createHousekeepingTask(taskData);
      }

      onSave(result);
      onClose();
    } catch (error: any) {
      alert(error.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add Housekeeping Task"}</DialogTitle>
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
            <Label htmlFor="room">Room (optional)</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g., Room 101"
            />
          </div>

          <div>
            <Label htmlFor="task">Task</Label>
            <Input
              id="task"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              placeholder="e.g., Deep Clean"
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
              </SelectContent>
            </Select>
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
              placeholder="Additional details..."
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
