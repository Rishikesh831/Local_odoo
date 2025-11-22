import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { deliveriesAPI } from '@/services/api';

const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDelivery();
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

  const handleValidate = async () => {
    try {
      await deliveriesAPI.validate(id);
      // Refresh delivery data to get updated status
      await fetchDelivery();
    } catch (err) {
      console.error('Error validating delivery:', err);
      alert('Failed to validate delivery');
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
            <Button onClick={handleValidate}>
              <Check className="w-4 h-4" />
              Validate
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
          {delivery.status === 'draft' && (
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          )}
        </div>

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
