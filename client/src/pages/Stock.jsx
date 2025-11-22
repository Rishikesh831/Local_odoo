import { Plus, Search, Download, Settings, MoreVertical, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { productsAPI } from '@/services/api';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (currentStock, reorderLevel) => {
    if (currentStock === 0 || currentStock === '0') return 'out';
    if (parseInt(currentStock) <= parseInt(reorderLevel || 0)) return 'low';
    return 'ok';
  };

  const getStatusBadge = (status) => {
    if (status === 'out') return <Badge variant="destructive">Out of Stock</Badge>; // Changed 'danger' to 'destructive' (common shadcn default)
    if (status === 'low') return <Badge variant="secondary">Low Stock</Badge>; // Changed 'warning' to 'secondary' or custom class
    return <Badge variant="outline">In Stock</Badge>; // Changed 'success' to 'outline' or custom class
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-secondary)' }}>Loading products...</p>
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
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Stock</h1>
          <button 
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <Input 
              placeholder="Search products by name or SKU..." 
              className="pl-10"
            />
          </div>
          <Select className="w-48">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="components">Components</option>
            <option value="raw-materials">Raw Materials</option>
            <option value="packaging">Packaging</option>
            <option value="finished-goods">Finished Goods</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-4 font-medium">Product Name</th>
                  <th className="p-4 font-medium">SKU</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Current Stock</th>
                  <th className="p-4 font-medium">Unit</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ 
                      padding: '32px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      No products found. Click "Create Product" to get started.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product.total_qty, product.reorder_level);
                    return (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {product.category || 'No category'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-primary)' }}>
                            {product.sku}
                          </code>
                        </td>
                        <td className="p-4" style={{ color: 'var(--text-secondary)' }}>
                            {product.category || '-'}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {product.total_qty || 0}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {product.reorder_level ? ` / ${product.reorder_level} min` : ''}
                          </span>
                        </td>
                        {/* Added Missing Unit Column */}
                        <td className="p-4" style={{ color: 'var(--text-secondary)' }}>
                            {product.unit || 'pcs'}
                        </td>
                        {/* Added Missing Status Column */}
                        <td className="p-4">
                            {getStatusBadge(stockStatus)}
                        </td>
                        {/* Added Missing Actions Column */}
                        <td className="p-4">
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center py-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {products.length} products
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Stock;