import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Calendar, DollarSign, Users, TrendingUp, TrendingDown } from "lucide-react";
import apiService from "@/services/api";

const Reports = () => {
  const [data, setData] = useState({
    properties: [],
    bookings: [],
    users: [],
    maintenance: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [properties, bookings, users, maintenance] = await Promise.all([
        apiService.getProperties(),
        apiService.getBookings(),
        apiService.getUsers(),
        apiService.getMaintenanceStats()
      ]);

      setData({ properties, bookings, users, maintenance });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const { properties, bookings, users } = data;
    
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const occupancyRate = properties.length > 0 ? Math.round((confirmedBookings / properties.length) * 100) : 0;
    const avgBookingValue = bookings.length > 0 ? Math.round(totalRevenue / bookings.length) : 0;

    const currentMonth = new Date().getMonth();
    const thisMonthBookings = bookings.filter(b => 
      new Date(b.createdAt).getMonth() === currentMonth
    );
    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    return {
      totalRevenue,
      confirmedBookings,
      occupancyRate,
      avgBookingValue,
      thisMonthRevenue,
      thisMonthBookings: thisMonthBookings.length,
      totalUsers: users.length,
      activeProperties: properties.filter(p => p.isActive).length
    };
  };

  const getTopProperties = () => {
    const { properties, bookings } = data;
    
    const propertyStats = properties.map(property => {
      const propertyBookings = bookings.filter(b => b.property?._id === property._id);
      const revenue = propertyBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      
      return {
        ...property,
        bookingCount: propertyBookings.length,
        revenue
      };
    });

    return propertyStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getRecentBookings = () => {
    return data.bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  const metrics = calculateMetrics();
  const topProperties = getTopProperties();
  const recentBookings = getRecentBookings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Occupancy Rate</p>
                <p className="text-3xl font-bold">{metrics.occupancyRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Avg Booking Value</p>
                <p className="text-3xl font-bold">${metrics.avgBookingValue}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Properties</p>
                <p className="text-3xl font-bold">{metrics.activeProperties}</p>
              </div>
              <Building2 className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProperties.map((property, index) => (
                <div key={property._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${property.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{property.bookingCount} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.property?.name || 'Property'}</p>
                    <p className="text-sm text-gray-600">{booking.user?.name || 'Guest'}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">${booking.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>This Month Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{metrics.thisMonthBookings}</p>
              <p className="text-sm text-gray-600">New Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${metrics.thisMonthRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{metrics.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{data.maintenance.pendingRequests || 0}</p>
              <p className="text-sm text-gray-600">Pending Maintenance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
