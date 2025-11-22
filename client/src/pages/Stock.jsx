import { useState, useEffect } from 'react';
import { Package, Warehouse, AlertTriangle, TrendingUp, Search, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { productsAPI } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import CreateStockModal from '@/components/CreateStockModal';
import axios from 'axios';

const Stock = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [detailedStock, setDetailedStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, stockRes] = await Promise.all([
        productsAPI.getAll(),
        axios.get('http://localhost:5000/api/stock/detailed')
      ]);
      setProducts(productsRes.data);
      setDetailedStock(stockRes.data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsRes.data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (qty, reorderLevel) => {
    if (qty === 0) return { label: 'Out of Stock', variant: 'danger' };
    if (qty <= reorderLevel) return { label: 'Low Stock', variant: 'warning' };
    return { label: 'In Stock', variant: 'success' };
  };

  const totalStockValue = products.reduce((sum, p) => sum + (parseFloat(p.total_qty) * parseFloat(p.unit_price)), 0);
  const lowStockCount = products.filter(p => parseFloat(p.total_qty) <= parseFloat(p.reorder_level) && parseFloat(p.total_qty) > 0).length;
  const outOfStockCount = products.filter(p => parseFloat(p.total_qty) === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Levels</h1>
          <p className="text-gray-500 mt-1">Monitor and manage inventory across all warehouses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : 'summary')}>
            <Package className="w-4 h-4 mr-2" />
            {viewMode === 'summary' ? 'Detailed View' : 'Summary View'}
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Stock Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalStockValue)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Unique Items</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">
                  {lowStockCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Needs Attention</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {outOfStockCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Urgent Action</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Warehouse className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by product name or SKU..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full lg:w-48"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {viewMode === 'summary' ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">SKU</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Total Quantity</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reorder Level</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Unit Price</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Stock Value</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product.total_qty, product.reorder_level);
                      const stockValue = parseFloat(product.total_qty) * parseFloat(product.unit_price);
                      
                      return (
                        <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer">
                          <td className="py-4 px-6">
                            <p className="font-semibold text-gray-900">{product.name}</p>
                          </td>
                          <td className="py-4 px-6">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{product.category}</td>
                          <td className="py-4 px-6">
                            <span className="font-semibold text-gray-900">{product.total_qty}</span>
                            <span className="text-gray-500 text-sm ml-1">{product.uom}</span>
                          </td>
                          <td className="py-4 px-6 text-gray-600">{product.reorder_level}</td>
                          <td className="py-4 px-6 text-gray-900">{formatCurrency(product.unit_price)}</td>
                          <td className="py-4 px-6 font-medium text-gray-900">
                            {formatCurrency(stockValue)}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                        </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">SKU</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Warehouse</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Location</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Quantity</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Unit Price</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedStock.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No stock records found
                      </td>
                    </tr>
                  ) : (
                    detailedStock
                      .filter(stock => {
                        const matchesSearch = stock.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            stock.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            stock.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());
                        const matchesCategory = !selectedCategory || stock.category === selectedCategory;
                        return matchesSearch && matchesCategory;
                      })
                      .map((stock, index) => {
                        const stockValue = parseFloat(stock.qty) * parseFloat(stock.unit_price);
                        
                        return (
                          <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <p className="font-semibold text-gray-900">{stock.product_name}</p>
                            </td>
                            <td className="py-4 px-6">
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{stock.sku}</code>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-1">
                                <Warehouse className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-900">{stock.warehouse_name}</span>
                              </div>
                              <p className="text-xs text-gray-500">{stock.warehouse_location}</p>
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant="secondary">{stock.location_name || `Loc-${stock.location_id}`}</Badge>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-gray-900">{parseFloat(stock.qty).toFixed(2)}</span>
                              <span className="text-gray-500 text-sm ml-1">{stock.uom}</span>
                            </td>
                            <td className="py-4 px-6 text-gray-900">{formatCurrency(stock.unit_price)}</td>
                            <td className="py-4 px-6 font-medium text-gray-900">
                              {formatCurrency(stockValue)}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">
            {viewMode === 'summary' ? (
              <>
                Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
                {selectedCategory && <span> in category <span className="font-semibold">{selectedCategory}</span></span>}
              </>
            ) : (
              <>
                Showing <span className="font-semibold">{detailedStock.filter(s => {
                  const matchesSearch = s.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       s.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       s.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = !selectedCategory || s.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                }).length}</span> of <span className="font-semibold">{detailedStock.length}</span> stock records
                {selectedCategory && <span> in category <span className="font-semibold">{selectedCategory}</span></span>}
              </>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Create Stock Modal */}
      <CreateStockModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Stock;
