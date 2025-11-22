import { useState, useEffect } from 'react';
import { Search, Grid, List, RefreshCw, Filter, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const MoveHistory = () => {
  const [moves, setMoves] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [filters, setFilters] = useState({
    reference: '',
    contact: '',
    status: '',
    move_type: '',
    from_date: '',
    to_date: ''
  });

  useEffect(() => {
    fetchData();
    fetchStatistics();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(debounce);
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = Object.entries(filters)
        .filter(([_, value]) => value)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      const response = await axios.get('http://localhost:5000/api/moves', { params });
      setMoves(response.data);
    } catch (error) {
      console.error('Error fetching moves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/moves/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status, moveType) => {
    const statusConfig = {
      draft: { variant: 'secondary', label: 'Draft' },
      ready: { variant: 'info', label: 'Ready' },
      completed: { variant: 'success', label: 'Completed' },
      in_transit: { variant: 'warning', label: 'In Transit' },
      cancelled: { variant: 'danger', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMoveTypeColor = (moveType) => {
    switch (moveType) {
      case 'receipt':
        return 'text-green-600 bg-green-50'; // IN moves - green
      case 'delivery':
        return 'text-red-600 bg-red-50'; // OUT moves - red
      case 'transfer':
        return 'text-blue-600 bg-blue-50'; // Internal - blue
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getMoveTypeIcon = (moveType) => {
    switch (moveType) {
      case 'receipt':
        return '📥';
      case 'delivery':
        return '📤';
      case 'transfer':
        return '🔄';
      default:
        return '📦';
    }
  };

  const handleExport = () => {
    const headers = ['Reference', 'Date', 'Contact', 'From', 'To', 'Quantity', 'Status', 'Type'];
    const csvData = moves.map(move => [
      move.reference,
      new Date(move.date).toLocaleDateString(),
      move.contact,
      move.from_location,
      move.to_location,
      move.quantity,
      move.status,
      move.move_type
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `move-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // ListView Component
  const ListView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reference</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">From</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">To</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Quantity</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    Loading moves...
                  </td>
                </tr>
              ) : moves.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500">
                    No moves found
                  </td>
                </tr>
              ) : (
                moves.map((move) => (
                  <tr 
                    key={`${move.move_type}-${move.move_id}`} 
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getMoveTypeColor(move.move_type)}`}>
                        {getMoveTypeIcon(move.move_type)}
                        {move.move_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {move.reference}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(move.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{move.contact}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-700">
                        {move.from_location}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-700">
                        {move.to_location}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{move.product_name}</p>
                        <p className="text-xs text-gray-500">{move.sku}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">{move.quantity}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(move.status, move.move_type)}
                    </td>
                    <td className="py-4 px-6">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.location.href = `/${move.move_type}s/${move.move_id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // KanbanView Component
  const KanbanView = () => {
    const statusColumns = ['draft', 'ready', 'in_transit', 'completed'];
    
    const getMovesForStatus = (status) => {
      return moves.filter(move => move.status === status);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map(status => (
          <Card key={status} className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {status.replace('_', ' ')}
                </h3>
                <Badge variant="secondary">
                  {getMovesForStatus(status).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {getMovesForStatus(status).map(move => (
                  <Card 
                    key={`${move.move_type}-${move.move_id}`}
                    className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/${move.move_type}s/${move.move_id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${getMoveTypeColor(move.move_type)}`}>
                          {getMoveTypeIcon(move.move_type)} {move.move_type.toUpperCase()}
                        </span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {move.reference}
                        </code>
                      </div>
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {move.product_name}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {move.from_location} → {move.to_location}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{move.contact}</span>
                        <span className="font-semibold">{move.quantity} units</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(move.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {getMovesForStatus(status).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No {status} moves
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Move History</h1>
        <p className="text-gray-600">Track all inventory movements across your warehouses</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Receipts</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.total_receipts}</p>
                  <p className="text-xs text-gray-500 mt-1">{statistics.total_received_qty} units</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-2xl">📥</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Deliveries</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.total_deliveries}</p>
                  <p className="text-xs text-gray-500 mt-1">{statistics.total_delivered_qty} units</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <span className="text-2xl">📤</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Internal Transfers</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.total_transfers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">In Transit</p>
                  <p className="text-2xl font-bold text-amber-600">{statistics.in_transit_moves}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <span className="text-2xl">🚚</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reference..."
                className="pl-10"
                value={filters.reference}
                onChange={(e) => handleFilterChange('reference', e.target.value)}
              />
            </div>
            
            <Input
              placeholder="Search contact..."
              value={filters.contact}
              onChange={(e) => handleFilterChange('contact', e.target.value)}
            />

            <Select
              value={filters.move_type}
              onChange={(e) => handleFilterChange('move_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="receipt">Receipts</option>
              <option value="delivery">Deliveries</option>
              <option value="transfer">Transfers</option>
            </Select>

            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="in_transit">In Transit</option>
              <option value="completed">Completed</option>
            </Select>

            <Input
              type="date"
              placeholder="From date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
            />

            <Input
              type="date"
              placeholder="To date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <Grid className="w-4 h-4 mr-2" />
                Kanban View
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={moves.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {viewMode === 'list' ? <ListView /> : <KanbanView />}
    </div>
  );
};

export default MoveHistory;
