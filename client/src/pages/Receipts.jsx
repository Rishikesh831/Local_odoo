import { Plus, Search, List, LayoutGrid, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Receipts = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  const receipts = [
    { 
      id: 'WH/IN/0001', 
      reference: 'WH/IN/0001',
      from: 'vendor', 
      to: 'WH/Stock1', 
      contact: 'Azure Interior',
      scheduleDate: '',
      status: 'Ready' 
    },
    { 
      id: 'WH/IN/0002', 
      reference: 'WH/IN/0002',
      from: 'vendor', 
      to: 'WH/Stock1', 
      contact: 'Azure Interior',
      scheduleDate: '',
      status: 'Ready' 
    },
  ];

  const getStatusBadge = (status) => {
    return <Badge variant="success">{status}</Badge>;
  };

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
            {receipts.map((receipt, index) => (
              <tr 
                key={receipt.id}
                style={{ 
                  borderBottom: index !== receipts.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ 
                  padding: '16px 24px',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
                }}>
                  {receipt.reference}
                </td>
                <td style={{ 
                  padding: '16px 24px',
                  color: 'var(--text-secondary)'
                }}>
                  {receipt.from}
                </td>
                <td style={{ 
                  padding: '16px 24px',
                  color: 'var(--text-secondary)'
                }}>
                  {receipt.to}
                </td>
                <td style={{ 
                  padding: '16px 24px',
                  color: 'var(--text-secondary)'
                }}>
                  {receipt.contact}
                </td>
                <td style={{ 
                  padding: '16px 24px',
                  color: 'var(--text-secondary)'
                }}>
                  {receipt.scheduleDate || '-'}
                </td>
                <td style={{ 
                  padding: '16px 24px'
                }}>
                  {getStatusBadge(receipt.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Receipts;
