import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { receiptsAPI, productsAPI, warehousesAPI } from '@/services/api';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReceiptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [newItem, setNewItem] = useState({ product_id: '', qty: '', warehouse_id: '' });
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchReceipt();
      fetchProducts();
      fetchWarehouses();
    }
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      const response = await receiptsAPI.getById(id);
      setReceipt(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch receipt');
      console.error('Error fetching receipt:', err);
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
    if (!receipt.items || receipt.items.length === 0) {
      toast.error('Cannot validate receipt: Please add at least one product');
      return;
    }

    try {
      setValidating(true);
      await receiptsAPI.validate(id);
      // Refresh receipt data
      await fetchReceipt();
      const statusMsg = receipt.status === 'draft' ? 'Ready' : 'Done';
      toast.success(`Receipt validated successfully! Status updated to ${statusMsg}`, { duration: 4000 });
    } catch (err) {
      console.error('Error validating receipt:', err);
      const errorMsg = err.response?.data?.error || 'Failed to validate receipt';
      const details = err.response?.data?.details;
      
      if (details && Array.isArray(details)) {
        toast.error(
          <div>
            <strong>{errorMsg}</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {details.map((detail, i) => <li key={i}>{detail}</li>)}
            </ul>
          </div>,
          { duration: 6000 }
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
      await receiptsAPI.addItem(id, newItem);
      setShowAddProduct(false);
      setNewItem({ product_id: '', qty: '', warehouse_id: '' });
      await fetchReceipt();
      toast.success('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      toast.error(err.response?.data?.error || 'Failed to add product');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    navigate('/receipts');
  };

  const getStatusBadge = () => {
    if (!receipt) return null;
    
    if (receipt.status === 'done') {
      return (
        <span className="px-6 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(115, 169, 127, 0.15)', color: 'var(--accent-green)' }}>
          Done
        </span>
      );
    }
    return (
      <span className="px-6 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(255, 193, 7, 0.15)', color: 'var(--accent-yellow)' }}>
        Draft &gt; Ready &gt; Done
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--text-secondary)' }}>Loading receipt...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: 'var(--accent-red)' }}>{error || 'Receipt not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)'
            }}
          >
            NEW
          </button>
          <h1 className="text-2xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
            Receipt
          </h1>
        </div>
        <button 
          className="w-10 h-10 rounded-full flex items-center justify-center border"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Δ</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleValidate}
          disabled={receipt.status === 'done' || validating}
          className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
          style={{ 
            backgroundColor: receipt.status === 'done' ? '#ccc' : 'var(--accent-green)',
            border: 'none',
            cursor: receipt.status === 'done' || validating ? 'not-allowed' : 'pointer',
            opacity: validating ? 0.7 : 1
          }}
        >
          {validating ? 'Validating...' : 'Validate'}
        </button>
        <button
          onClick={handlePrint}
          disabled={receipt.status !== 'done'}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ 
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            cursor: receipt.status !== 'done' ? 'not-allowed' : 'pointer',
            opacity: receipt.status !== 'done' ? 0.5 : 1
          }}
        >
          Print
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ 
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        >
          Cancel
        </button>
        
        <div className="ml-auto">
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="rounded-xl p-8"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Reference Number */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold m-0" style={{ color: 'var(--text-primary)' }}>
            WH/IN/{String(receipt.id).padStart(4, '0')}
          </h2>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Receive From
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-lg"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)'
              }}
              value={receipt.vendor || ''}
              placeholder="Select vendor..."
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Schedule Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg"
              style={{
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)'
              }}
              value={receipt.schedule_date ? receipt.schedule_date.split('T')[0] : ''}
              readOnly
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Responsible
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg"
            style={{
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)'
            }}
            value={receipt.responsible || ''}
            placeholder="Auto-fill with current logged in user"
            readOnly
          />
        </div>

        {/* Products Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Products
          </h3>
          
          <table className="w-full mb-4">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Product
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '12px 16px',
                  fontWeight: '600',
                  color: 'var(--text-primary)'
                }}>
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {receipt.items && receipt.items.length > 0 ? (
                receipt.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ 
                      padding: '16px',
                      color: 'var(--text-primary)'
                    }}>
                      [{item.sku}] {item.product_name}
                    </td>
                    <td style={{ 
                      textAlign: 'right',
                      padding: '16px',
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}>
                      {item.qty}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" style={{ 
                    padding: '16px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    No products added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {receipt.status !== 'done' && (
            <>
              {!showAddProduct ? (
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-lg"
                  style={{ 
                    color: 'var(--accent-green)',
                    border: '1px dashed var(--accent-green)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(115, 169, 127, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              ) : (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(115, 169, 127, 0.05)', border: '1px solid var(--accent-green)' }}>
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
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setNewItem({ product_id: '', qty: '', warehouse_id: '' });
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: 'var(--accent-green)', border: 'none' }}
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Side Notes */}
      <div className="grid grid-cols-3 gap-6">
        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            <strong>To DO</strong> = When in Draft
          </p>
          <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-primary)' }}>
            <strong>Validate</strong> = When in Ready
          </p>
          <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
            On click, TODO, move to Ready
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            onclick, Validate move to Done
          </p>
        </div>

        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Auto fill with the current logged in users.
          </p>
        </div>

        <div 
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            <strong>Draft</strong> - Initial stage
          </p>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            <strong>Ready</strong> - Ready to receive
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            <strong>Done</strong> - Received
          </p>
        </div>
      </div>

      <div 
        className="p-4 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)'
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Print the receipt once it's DONE
        </p>
      </div>
    </div>
  );
};

export default ReceiptDetail;
