import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Grid, List, MapPin, DollarSign, Users, Star } from 'lucide-react';
import { useProperties, useCreateProperty, useDeleteProperty } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import PropertyCard from './PropertyCard';
import PropertyForm from './PropertyForm';
import PropertyFilters from './PropertyFilters';
import { cn } from '../../lib/utils';

const PropertyManager = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    guests: '',
    amenities: [],
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { canAccess } = useAuth();
  const { success, error: showError } = useNotification();

  // API hooks
  const {
    data: properties = [],
    loading,
    error,
    refetch,
  } = useProperties(filters, {
    onError: (err) => showError('Failed to load properties'),
  });

  const createPropertyMutation = useCreateProperty({
    onSuccess: () => {
      success('Property created successfully');
      setShowForm(false);
      refetch();
    },
    onError: (err) => showError('Failed to create property'),
  });

  const deletePropertyMutation = useDeleteProperty({
    onSuccess: () => {
      success('Property deleted successfully');
      refetch();
    },
    onError: (err) => showError('Failed to delete property'),
  });

  // Filter and search properties
  const filteredProperties = useMemo(() => {
    if (!properties) return [];

    return properties.filter(property => {
      const matchesSearch = !searchQuery || 
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'active' && property.isActive) ||
        (filters.status === 'inactive' && !property.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [properties, searchQuery, filters.status]);

  const handleCreateProperty = async (propertyData) => {
    try {
      await createPropertyMutation.mutate(propertyData);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deletePropertyMutation.mutate(propertyId);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      guests: '',
      amenities: [],
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setSearchQuery('');
  };

  if (loading && !properties.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading properties..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p>Failed to load properties</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
        <button
          onClick={refetch}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your property listings and bookings
          </p>
        </div>
        
        {canAccess('properties', 'create') && (
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium',
              showFilters
                ? 'border-blue-300 text-blue-700 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-l-md',
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 text-sm font-medium rounded-r-md border-l border-gray-300',
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <PropertyFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={clearFilters}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <Grid className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <p className="text-lg font-semibold text-gray-900">{properties.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-lg font-semibold text-gray-900">
                {properties.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg. Price</p>
              <p className="text-lg font-semibold text-gray-900">
                ${properties.length > 0 
                  ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
              <p className="text-lg font-semibold text-gray-900">
                {properties.length > 0 
                  ? (properties.reduce((sum, p) => sum + (p.rating || 0), 0) / properties.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties List */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery || Object.values(filters).some(v => v && v.length > 0) ? (
              <p>No properties match your search criteria</p>
            ) : (
              <p>No properties found</p>
            )}
          </div>
          {(searchQuery || Object.values(filters).some(v => v && v.length > 0)) && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-500"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              viewMode={viewMode}
              onDelete={canAccess('properties', 'delete') ? handleDeleteProperty : null}
              loading={deletePropertyMutation.loading}
            />
          ))}
        </div>
      )}

      {/* Loading overlay */}
      {loading && properties.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <LoadingSpinner text="Updating properties..." />
          </div>
        </div>
      )}

      {/* Property Form Modal */}
      {showForm && (
        <PropertyForm
          onSubmit={handleCreateProperty}
          onCancel={() => setShowForm(false)}
          loading={createPropertyMutation.loading}
        />
      )}
    </div>
  );
};

export default PropertyManager;
