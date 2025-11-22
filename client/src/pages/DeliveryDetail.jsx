import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { deliveriesAPI, productsAPI, warehousesAPI } from '@/services/api';
import toast from 'react-hot-toast';

const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [newItem, setNewItem] = useState({ product_id: '', qty: '', warehouse_id: '' });
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    fetchDelivery();
    fetchProducts();
    fetchWarehouses();
  }, [id]);

  const fetchDelivery = async () => {
    try {
      setLoading(true);
      const response = await deliveriesAPI.getById(id);
      setDelivery(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch delivery details');
      console.error('Error fetching delivery:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await warehousesAPI.getAll();
      setWarehouses(response.data);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
    }
  };

  const handleValidate = async () => {
    // Check if there are items
    if (!delivery.items || delivery.items.length === 0) {
      toast.error('Cannot validate delivery: Please add at least one product');
      return;
    }

    try {
      setValidating(true);
      await deliveriesAPI.validate(id);
      // Refresh delivery data to get updated status
      await fetchDelivery();
      
      const statusMsg = delivery.status === 'draft' ? 'moved to Ready' : 'completed and stock reduced';
      toast.success(`Delivery validated successfully! Status ${statusMsg}.`, { duration: 4000 });
    } catch (err) {
      console.error('Error validating delivery:', err);
      const errorMsg = err.response?.data?.error || 'Failed to validate delivery';
      const details = err.response?.data?.details;
      
      if (details && Array.isArray(details)) {
        // Stock shortage error with details
        toast.error(
          <div>
            <strong>{errorMsg}</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {details.map((detail, i) => <li key={i}>{detail}</li>)}
            </ul>
            <p style={{ marginTop: '8px', fontSize: '13px', opacity: 0.9 }}>
              💡 Please add stock via receipts before completing this delivery.
            </p>
          </div>,
          { duration: 8000 }
        );
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setValidating(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newItem.product_id || !newItem.qty || !newItem.warehouse_id) {
      toast.error('Please fill all product details');
      return;
    }

    try {
      await deliveriesAPI.addItem(id, newItem);
      setShowAddProduct(false);
      setNewItem({ product_id: '', qty: '', warehouse_id: '' });
      await fetchDelivery();
      toast.success('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error(err.response?.data?.error || 'Failed to add product');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      draft: 'draft',
      ready: 'warning',
      done: 'success'
    };
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    return <Badge variant={statusMap[status] || 'draft'}>{displayStatus}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-secondary)' }}>Loading delivery...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--accent-red)' }}>{error || 'Delivery not found'}</p>
      </div>
    );
  }

  const reference = `WH/OUT/${String(delivery.id).padStart(4, '0')}`;
  const canValidate = delivery.status === 'draft' || delivery.status === 'ready';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/deliveries')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
              {reference}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Delivery Order
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {canValidate && (
            <Button onClick={handleValidate} disabled={validating}>
              <Check className="w-4 h-4 mr-2" />
              {validating ? 'Validating...' : 'Validate'}
            </Button>
          )}
          {getStatusBadge(delivery.status)}
        </div>
      </div>

      {/* Delivery Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Customer
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              {delivery.customer || '-'}
            </p>
          </div>
          <div>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Schedule Date
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              {delivery.schedule_date ? new Date(delivery.schedule_date).toLocaleDateString() : '-'}
            </p>
          </div>
          <div>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Responsible
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              {delivery.responsible || '-'}
            </p>
          </div>
          <div>
            <p style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Created Date
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              {delivery.created_at ? new Date(delivery.created_at).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Products
          </h2>
          {delivery.status !== 'done' && !showAddProduct && (
            <Button variant="outline" size="sm" onClick={() => setShowAddProduct(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          )}
        </div>

        {/* Add Product Form */}
        {showAddProduct && delivery.status !== 'done' && (
          <Card className="mb-4 p-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgb(59, 130, 246)' }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Add New Product</h4>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setNewItem({ product_id: '', qty: '', warehouse_id: '' });
                }}
                className="p-1 rounded hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Product *
                </label>
                <select
                  value={newItem.product_id}
                  onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                  placeholder="Enter qty"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Warehouse *
                </label>
                <select
                  value={newItem.warehouse_id}
                  onChange={(e) => setNewItem({ ...newItem, warehouse_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddProduct(false);
                  setNewItem({ product_id: '', qty: '', warehouse_id: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddProduct}
              >
                Add Product
              </Button>
            </div>
          </Card>
        )}

        <div 
          className="rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '16px 24px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  Product
                </th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '16px 24px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  SKU
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '16px 24px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {!delivery.items || delivery.items.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ 
                    padding: '32px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No products added yet
                  </td>
                </tr>
              ) : (
                delivery.items.map((item, index) => (
                  <tr 
                    key={item.id}
                    style={{ 
                      borderBottom: index !== delivery.items.length - 1 ? '1px solid var(--border-color)' : 'none'
                    }}
                  >
                    <td style={{ 
                      padding: '16px 24px',
                      color: 'var(--text-primary)',
                      fontWeight: '500'
                    }}>
                      {item.product_name}
                    </td>
                    <td style={{ 
                      padding: '16px 24px',
                      color: 'var(--text-secondary)'
                    }}>
                      {item.sku || '-'}
                    </td>
                    <td style={{ 
                      padding: '16px 24px',
                      color: 'var(--text-primary)',
                      textAlign: 'right',
                      fontWeight: '600'
                    }}>
                      {item.qty}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetail;
