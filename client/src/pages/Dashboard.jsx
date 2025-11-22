import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, MoreVertical, Info, RefreshCw, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productsAPI, receiptsAPI, deliveriesAPI } from '@/services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, receiptsRes, deliveriesRes] = await Promise.all([
        productsAPI.getAll(),
        receiptsAPI.getAll(),
        deliveriesAPI.getAll()
      ]);
      
      setProducts(productsRes.data);
      setReceipts(receiptsRes.data);
      setDeliveries(deliveriesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  // Calculate KPIs
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (parseFloat(p.total_qty || 0) * parseFloat(p.unit_price || 0)), 0);
  const lowStockItems = products.filter(p => parseFloat(p.total_qty || 0) <= parseFloat(p.reorder_level || 0) && parseFloat(p.total_qty || 0) > 0);
  const outOfStockItems = products.filter(p => parseFloat(p.total_qty || 0) === 0);
  const pendingOrders = receipts.filter(r => r.status === 'draft' || r.status === 'ready').length + 
                        deliveries.filter(d => d.status === 'draft' || d.status === 'ready').length;

  // Recent orders - combine receipts and deliveries
  const recentOrders = [
    ...receipts.slice(0, 3).map(r => ({
      id: `WH/IN/${String(r.id).padStart(4, '0')}`,
      type: 'Receipt',
      date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '-',
      status: r.status,
      actualId: r.id,
      category: 'receipt'
    })),
    ...deliveries.slice(0, 2).map(d => ({
      id: `WH/OUT/${String(d.id).padStart(4, '0')}`,
      type: 'Delivery',
      date: d.created_at ? new Date(d.created_at).toLocaleDateString() : '-',
      status: d.status,
      actualId: d.id,
      category: 'delivery'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  // Inventory alerts
  const inventoryAlerts = [
    ...outOfStockItems.map(p => ({
      product: p,
      title: `${p.name} - Out of Stock`,
      details: `Current: 0 ${p.uom} • Minimum: ${p.reorder_level} ${p.uom}`,
      severity: 'critical'
    })),
    ...lowStockItems.map(p => ({
      product: p,
      title: `${p.name} - Low Stock`,
      details: `Current: ${p.total_qty} ${p.uom} • Minimum: ${p.reorder_level} ${p.uom}`,
      severity: 'warning'
    }))
  ].slice(0, 5);

  const kpiData = [
    { label: 'Total Products', value: totalProducts.toString(), change: `${products.length} items`, trend: 'up' },
    { label: 'Total Value', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, change: 'Current stock', trend: 'up' },
    { label: 'Low Stock Items', value: lowStockItems.length.toString(), change: `${outOfStockItems.length} out of stock`, trend: lowStockItems.length > 0 ? 'down' : 'up' },
    { label: 'Pending Orders', value: pendingOrders.toString(), change: `${receipts.filter(r => r.status === 'draft').length + deliveries.filter(d => d.status === 'draft').length} drafts`, trend: 'up' },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      done: 'success',
      ready: 'warning',
      draft: 'draft',
    };
    return <Badge variant={variants[status] || 'draft'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const handleOrderClick = (order) => {
    if (order.category === 'receipt') {
      navigate(`/receipts/${order.actualId}`);
    } else {
      navigate(`/deliveries/${order.actualId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Info Icon */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <button 
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's what's happening with your inventory today.</p>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div 
            key={index}
            className="rounded-xl p-6"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <span className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              {kpi.label}
            </span>
            <span className="text-3xl font-bold block mb-1" style={{ color: 'var(--text-primary)' }}>
              {kpi.value}
            </span>
            <div 
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={kpi.trend === 'up' ? {
                backgroundColor: 'rgba(115, 169, 127, 0.15)',
                color: 'var(--accent-green)'
              } : {
                backgroundColor: 'rgba(217, 115, 115, 0.15)',
                color: 'var(--accent-red)'
              }}
            >
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{kpi.change}</span>
              <span>from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders & Production Schedule - Original Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest incoming and outgoing operations</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/operations')}>View All</Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent orders
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.id}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{order.type}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{order.date}</td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOrderClick(order)}>View</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Stock Summary</CardTitle>
              <CardDescription>Current inventory status</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/stock')}>View Details</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Products</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{products.length}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Low Stock Items</p>
                  <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <TrendingDown className="w-6 h-6 text-amber-600" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{outOfStockItems.length}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/stock')}>View All Alerts</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {inventoryAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>✓ All inventory levels are healthy!</p>
            </div>
          ) : (
            inventoryAlerts.map((alert, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer hover:bg-opacity-80"
                style={{ 
                  backgroundColor: alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                  border: `1px solid ${alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                }}
                onClick={() => navigate(`/products/${alert.product.id}`)}
              >
                <div>
                  <h4 className="font-medium m-0" style={{ color: 'var(--text-primary)' }}>{alert.title}</h4>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{alert.details}</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/receipts');
                  }}
                >
                  Reorder
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
