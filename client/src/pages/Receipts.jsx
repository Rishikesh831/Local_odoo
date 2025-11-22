import { Plus, Search, List, LayoutGrid, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { receiptsAPI } from '@/services/api';

const Receipts = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptsAPI.getAll();
      setReceipts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch receipts');
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptClick = (receiptId) => {
    navigate(`/receipts/${receiptId}`);
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
        <p style={{ color: 'var(--text-secondary)' }}>Loading receipts...</p>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>
          Receipts
        </h1>
        <Button>
          <Plus className="w-4 h-4" />
          NEW
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <Input 
            placeholder="Search by reference & contacts..." 
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
            style={{ border: '1px solid var(--border-color)' }}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded transition-colors ${viewMode === 'kanban' ? 'bg-gray-200' : ''}`}
            style={{ border: '1px solid var(--border-color)' }}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Receipts Table */}
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
                Reference
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '16px 24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                From
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '16px 24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                To
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '16px 24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                Contact
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '16px 24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                Schedule date
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: '16px 24px',
                fontWeight: '600',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)'
              }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {receipts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ 
                  padding: '32px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  No receipts found. Click "NEW" to create one.
                </td>
              </tr>
            ) : (
              receipts.map((receipt, index) => (
                <tr 
                  key={receipt.id}
                  style={{ 
                    borderBottom: index !== receipts.length - 1 ? '1px solid var(--border-color)' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleReceiptClick(receipt.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ 
                    padding: '16px 24px',
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    WH/IN/{String(receipt.id).padStart(4, '0')}
                  </td>
                  <td style={{ 
                    padding: '16px 24px',
                    color: 'var(--text-secondary)'
                  }}>
                    {receipt.vendor || 'vendor'}
                  </td>
                  <td style={{ 
                    padding: '16px 24px',
                    color: 'var(--text-secondary)'
                  }}>
                    WH/Stock1
                  </td>
                  <td style={{ 
                    padding: '16px 24px',
                    color: 'var(--text-secondary)'
                  }}>
                    {receipt.vendor || '-'}
                  </td>
                  <td style={{ 
                    padding: '16px 24px',
                    color: 'var(--text-secondary)'
                  }}>
                    {receipt.schedule_date ? new Date(receipt.schedule_date).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ 
                    padding: '16px 24px'
                  }}>
                    {getStatusBadge(receipt.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipts;
