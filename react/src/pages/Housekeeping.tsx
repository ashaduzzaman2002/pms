import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { HousekeepingModal } from "@/components/HousekeepingModal";
import apiService from "@/services/api";

const Housekeeping = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiService.getHousekeepingTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching housekeeping tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await apiService.deleteHousekeepingTask(taskId);
        setTasks(tasks.filter(t => t._id !== taskId));
      } catch (error: any) {
        alert(error.message || 'Failed to delete task');
      }
    }
  };

  const handleSave = (savedTask: any) => {
    if (editingTask) {
      setTasks(tasks.map(t => 
        t._id === savedTask._id ? savedTask : t
      ));
    } else {
      setTasks([...tasks, savedTask]);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await apiService.updateHousekeepingTask(taskId, { status });
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTasks = statusFilter === "all" 
    ? tasks 
    : tasks.filter(task => task.status === statusFilter);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Housekeeping</h1>
        <div className="space-y-4">
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
        <h1 className="text-3xl font-bold">Housekeeping</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex gap-4">
        <Input placeholder="Search tasks..." className="max-w-sm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No housekeeping tasks found</p>
              <Button onClick={handleAdd} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {task.property?.name || 'Property'} {task.room && `- ${task.room}`}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{task.task}</h3>
                    {task.description && (
                      <p className="text-gray-600">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {task.assignee.name}
                        </div>
                      )}
                      {task.scheduledDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.scheduledDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {task.status !== 'completed' && (
                        <>
                          {task.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateTaskStatus(task._id, 'in-progress')}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === 'in-progress' && (
                            <Button 
                              size="sm" 
                              onClick={() => updateTaskStatus(task._id, 'completed')}
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

      <HousekeepingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
      />
    </div>
  );
};

export default Housekeeping;
