import { Plus, TrendingUp, TrendingDown, MoreVertical, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const kpiData = [
    { label: 'Total Products', value: '1,234', change: '+12%', trend: 'up' },
    { label: 'Total Value', value: '$456,789', change: '+8.2%', trend: 'up' },
    { label: 'Low Stock Items', value: '23', change: '5 more', trend: 'down' },
    { label: 'Pending Orders', value: '47', change: '-15%', trend: 'up' },
  ];

  const recentOrders = [
    { id: 'ORD-1001', type: 'Receipt', date: 'Nov 22, 2025', status: 'complete' },
    { id: 'ORD-1002', type: 'Delivery', date: 'Nov 22, 2025', status: 'processing' },
    { id: 'ORD-1003', type: 'Receipt', date: 'Nov 21, 2025', status: 'shipped' },
    { id: 'ORD-1004', type: 'Delivery', date: 'Nov 21, 2025', status: 'draft' },
    { id: 'ORD-1005', type: 'Receipt', date: 'Nov 20, 2025', status: 'complete' },
  ];

  const productionSchedule = [
    { name: 'Widget A - Batch #045', progress: 85, due: 'Nov 25, 2025' },
    { name: 'Component B - Batch #102', progress: 62, due: 'Nov 28, 2025' },
    { name: 'Assembly Line C', progress: 45, due: 'Dec 01, 2025' },
    { name: 'Quality Check - Batch #089', progress: 95, due: 'Nov 23, 2025' },
  ];

  const inventoryAlerts = [
    { title: 'Widget A Pro - Low Stock', details: 'Current: 5 units • Minimum: 20 units' },
    { title: 'Component XYZ - Out of Stock', details: 'Current: 0 units • Minimum: 50 units' },
    { title: 'Raw Material 123 - Low Stock', details: 'Current: 15 units • Minimum: 100 units' },
    { title: 'Packaging Materials - Low Stock', details: 'Current: 25 units • Minimum: 200 units' },
    { title: 'Spare Parts Kit - Low Stock', details: 'Current: 8 units • Minimum: 30 units' },
  ];

  // Receipt and Delivery data
  const receipts = {
    toReceive: 4,
    late: 1,
    operations: 6
  };

  const deliveries = {
    toDeliver: 4,
    late: 1,
    waiting: 2,
    operations: 6
  };

  const getStatusBadge = (status) => {
    const variants = {
      complete: 'success',
      processing: 'warning',
      shipped: 'info',
      draft: 'draft',
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

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
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Welcome back! Here's what's happening with your inventory today.</p>
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
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
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
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Production Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Production Schedule</CardTitle>
              <CardDescription>Current manufacturing progress</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {productionSchedule.map((item, index) => (
              <div key={index} className={index === productionSchedule.length - 1 ? '' : 'mb-6'}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.progress}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--border-color)' }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ 
                      width: `${item.progress}%`,
                      backgroundColor: item.progress >= 70 ? 'var(--accent-green)' : 'var(--accent-yellow)'
                    }}
                  />
                </div>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Due: {item.due}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts - Original Design */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </div>
          <Button variant="outline" size="sm">View All Alerts</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {inventoryAlerts.map((alert, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: 'var(--bg-card)' }}
            >
              <div>
                <h4 className="font-medium m-0" style={{ color: 'var(--text-primary)' }}>{alert.title}</h4>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{alert.details}</p>
              </div>
              <Button variant="secondary" size="sm">Reorder</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
