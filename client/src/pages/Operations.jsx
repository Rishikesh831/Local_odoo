import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { receiptsAPI, deliveriesAPI } from '@/services/api';

const Operations = () => {
  const [receipts, setReceipts] = useState({
    toReceive: 0,
    late: 0,
    operations: 0
  });

  const [deliveries, setDeliveries] = useState({
    toDeliver: 0,
    late: 0,
    waiting: 0,
    operations: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperationsData();
  }, []);

  const fetchOperationsData = async () => {
    try {
      setLoading(true);
      const [receiptData, deliveryData] = await Promise.all([
        receiptsAPI.getAll(),
        deliveriesAPI.getAll()
      ]);

      // Calculate receipt stats
      const now = new Date();
      const receiptStats = {
        toReceive: receiptData.filter(r => r.status === 'draft' || r.status === 'waiting').length,
        late: receiptData.filter(r => {
          if (r.status === 'done') return false;
          const scheduleDate = new Date(r.schedule_date);
          return scheduleDate < now;
        }).length,
        operations: receiptData.length
      };

      // Calculate delivery stats
      const deliveryStats = {
        toDeliver: deliveryData.filter(d => d.status === 'draft' || d.status === 'waiting').length,
        late: deliveryData.filter(d => {
          if (d.status === 'done') return false;
          const scheduleDate = new Date(d.schedule_date);
          return scheduleDate < now;
        }).length,
        waiting: deliveryData.filter(d => d.status === 'waiting').length,
        operations: deliveryData.length
      };

      setReceipts(receiptStats);
      setDeliveries(deliveryStats);
    } catch (err) {
      console.error('Failed to fetch operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading operations data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Info Icon */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold m-0" style={{ color: 'var(--text-primary)' }}>Operations</h1>
          <button 
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage incoming receipts and outgoing deliveries</p>
      </div>

      {/* Receipt and Delivery Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receipt Card */}
        <div 
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div 
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <h3 className="text-xl font-semibold m-0" style={{ color: 'var(--text-primary)' }}>
              Receipt
            </h3>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ 
                backgroundColor: 'var(--accent-green)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {receipts.toReceive} to receive
            </button>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                <strong>{receipts.late}</strong> Late
              </div>
              <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                <strong>{receipts.operations}</strong> operations
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Card */}
        <div 
          className="rounded-xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div 
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <h3 className="text-xl font-semibold m-0" style={{ color: 'var(--text-primary)' }}>
              Delivery
            </h3>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ 
                backgroundColor: 'var(--accent-green)',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {deliveries.toDeliver} to Deliver
            </button>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                <strong>{deliveries.late}</strong> Late
              </div>
              <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                <strong>{deliveries.waiting}</strong> waiting
              </div>
              <div className="text-base" style={{ color: 'var(--text-primary)' }}>
                <strong>{deliveries.operations}</strong> operations
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div 
        className="p-4 rounded-lg border-l-4"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--accent-blue)'
        }}
      >
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Late: schedule date {'<'} today's date
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Operations: schedule date {'>'} today's date
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Waiting: Waiting for the stocks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operations;
