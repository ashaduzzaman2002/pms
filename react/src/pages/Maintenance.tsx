import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, AlertTriangle, Calendar, DollarSign, Plus, Edit, Trash2 } from "lucide-react";
import { MaintenanceModal } from "@/components/MaintenanceModal";
import apiService from "@/services/api";

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    completedRequests: 0,
    totalCost: 0
  });
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsData, statsData] = await Promise.all([
        apiService.getMaintenanceRequests(),
        apiService.getMaintenanceStats()
      ]);
      
      setRequests(requestsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRequest(null);
    setModalOpen(true);
  };

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setModalOpen(true);
  };

  const handleDelete = async (requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      try {
        await apiService.deleteMaintenanceRequest(requestId);
        setRequests(requests.filter(r => r._id !== requestId));
        // Refresh stats
        const statsData = await apiService.getMaintenanceStats();
        setStats(statsData);
      } catch (error: any) {
        alert(error.message || 'Failed to delete request');
      }
    }
  };

  const handleSave = async (savedRequest: any) => {
    if (editingRequest) {
      setRequests(requests.map(r => 
        r._id === savedRequest._id ? savedRequest : r
      ));
    } else {
      setRequests([...requests, savedRequest]);
    }
    // Refresh stats
    const statsData = await apiService.getMaintenanceStats();
    setStats(statsData);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      await apiService.updateMaintenanceRequest(requestId, { status });
      setRequests(requests.map(request => 
        request._id === requestId ? { ...request, status } : request
      ));
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "in-progress": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRequests = priorityFilter === "all" 
    ? requests 
    : requests.filter(request => request.priority === priorityFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Create Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgressRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalCost}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search requests..." className="max-w-sm" />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No maintenance requests found</p>
              <Button onClick={handleAdd} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{request.property?.name || 'Property'}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{request.issue}</h3>
                    {request.description && (
                      <p className="text-gray-600">{request.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {request.technician && (
                        <span>Assigned to: {request.technician.name}</span>
                      )}
                      {request.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.scheduledDate).toLocaleDateString()}
                        </div>
                      )}
                      {(request.estimatedCost > 0 || request.actualCost > 0) && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${request.actualCost || request.estimatedCost}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(request.priority)}>{request.priority}</Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(request)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(request._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {request.status !== 'completed' && (
                        <>
                          {request.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateRequestStatus(request._id, 'assigned')}
                            >
                              Assign
                            </Button>
                          )}
                          {request.status === 'assigned' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateRequestStatus(request._id, 'in-progress')}
                            >
                              Start Work
                            </Button>
                          )}
                          {request.status === 'in-progress' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateRequestStatus(request._id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <MaintenanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        request={editingRequest}
      />
    </div>
  );
};

export default Maintenance;
