import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Settings,
  ChevronDown,
  Inbox,
  Send
} from 'lucide-react';

const TopNav = () => {
  const location = useLocation();
  const [operationsOpen, setOperationsOpen] = useState(false);
  const timeoutRef = useRef(null);
  
  const isOperationsActive = location.pathname === '/receipts' || location.pathname === '/deliveries';

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOperationsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOperationsOpen(false);
    }, 150);
  };

  return (
    <nav className="bg-white border-b fixed top-0 left-0 right-0 z-50" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <Package className="w-6 h-6" style={{ color: 'var(--accent-green)' }} />
          StockMaster
        </div>
        
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="px-4 py-2 font-medium transition-colors"
            style={location.pathname === '/' || location.pathname === '/dashboard' ? {
              borderBottom: '2px solid var(--accent-green)',
              color: 'var(--accent-green)'
            } : {
              color: 'var(--text-secondary)'
            }}
          >
            Dashboard
          </Link>
          
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="flex items-center gap-2 px-4 py-2 font-medium transition-colors"
              style={isOperationsActive ? {
                borderBottom: '2px solid var(--accent-green)',
                color: 'var(--accent-green)'
              } : {
                color: 'var(--text-secondary)'
              }}
            >
              Operations
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {operationsOpen && (
              <div 
                className="absolute left-0 w-48 rounded-lg shadow-lg overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  top: 'calc(100% + 8px)',
                  zIndex: 1000
                }}
              >
                <Link
                  to="/receipts"
                  className="flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Inbox className="w-4 h-4" />
                  Receipts
                </Link>
                <Link
                  to="/deliveries"
                  className="flex items-center gap-3 px-4 py-3 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Send className="w-4 h-4" />
                  Deliveries
                </Link>
              </div>
            )}
          </div>
          
          <Link
            to="/stock"
            className="px-4 py-2 font-medium transition-colors"
            style={location.pathname === '/stock' ? {
              borderBottom: '2px solid var(--accent-green)',
              color: 'var(--accent-green)'
            } : {
              color: 'var(--text-secondary)'
            }}
          >
            Stock
          </Link>
          
          <Link
            to="/reports"
            className="px-4 py-2 font-medium transition-colors"
            style={location.pathname === '/reports' ? {
              borderBottom: '2px solid var(--accent-green)',
              color: 'var(--accent-green)'
            } : {
              color: 'var(--text-secondary)'
            }}
          >
            Reports
          </Link>
          
          <Link
            to="/settings"
            className="px-4 py-2 font-medium transition-colors"
            style={location.pathname === '/settings' ? {
              borderBottom: '2px solid var(--accent-green)',
              color: 'var(--accent-green)'
            } : {
              color: 'var(--text-secondary)'
            }}
          >
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
};

const Layout = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <TopNav />
      <main className="pt-24 px-8 pb-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
