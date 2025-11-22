import { Plus, Search, Download, Settings, RefreshCw, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { deliveriesAPI } from '@/services/api';
import CreateDeliveryModal from '@/components/CreateDeliveryModal';

const Deliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveriesAPI.getAll();
      setDeliveries(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deliveries');
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryClick = (deliveryId) => {
    navigate(`/deliveries/${deliveryId}`);
  };

  const kpiData = [
    { label: 'Total Deliveries', value: deliveries.length.toString(), subtitle: 'All time' },
    { label: 'Ready to Ship', value: deliveries.filter(d => d.status === 'ready').length.toString(), badge: 'warning', badgeText: 'Awaiting pickup' },
    { label: 'Done', value: deliveries.filter(d => d.status === 'done').length.toString(), badge: 'success', badgeText: 'Delivered' },
    { label: 'Draft', value: deliveries.filter(d => d.status === 'draft').length.toString(), badge: 'draft', badgeText: 'In progress' },
  ];

  const getStatusBadge = (status) => {
    const variants = { done: 'success', ready: 'warning', draft: 'draft' };
    return <Badge variant={variants[status] || 'draft'}>{status === 'ready' ? 'Ready to Ship' : status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  // Filter deliveries based on search term and status
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = searchTerm === '' || 
      delivery.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(delivery.id).includes(searchTerm);
    
    const matchesStatus = statusFilter === '' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-secondary)' }}>Loading deliveries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--accent-red)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-500 mt-1">Manage outgoing shipments and customer orders</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Delivery
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by reference or customer..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            className="w-44"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready to Ship</option>
            <option value="done">Done</option>
          </Select>
          <Input type="date" className="w-44" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="p-6">
            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
            {kpi.badge ? (
              <Badge variant={kpi.badge} className="mt-2">{kpi.badgeText}</Badge>
            ) : (
              <p className="text-sm text-gray-500 mt-2">{kpi.subtitle}</p>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Deliveries</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reference</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Ship Date</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Products</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Total Qty</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-6 text-center text-gray-500">
                      {deliveries.length === 0 ? 'No deliveries found. Click "Create Delivery" to get started.' : 'No deliveries match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr 
                      key={delivery.id} 
                      className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleDeliveryClick(delivery.id)}
                    >
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">WH/OUT/{String(delivery.id).padStart(4, '0')}</p>
                        <p className="text-sm text-gray-500">
                          Created: {delivery.created_at ? new Date(delivery.created_at).toLocaleDateString() : '-'}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900">{delivery.customer || 'Customer'}</p>
                        <p className="text-sm text-gray-500">{delivery.customer || '-'}</p>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {delivery.schedule_date ? new Date(delivery.schedule_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{delivery.item_count || 0} items</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold">-</span> units
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(delivery.status)}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          {delivery.status === 'draft' && <Button variant="outline" size="sm">Edit</Button>}
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center py-4">
          <p className="text-sm text-gray-500">Showing {filteredDeliveries.length} of {deliveries.length} deliveries</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Create Delivery Modal */}
      <CreateDeliveryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchDeliveries}
      />
    </div>
  );
};

export default Deliveries;
