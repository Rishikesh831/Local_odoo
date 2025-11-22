import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingUp, 
  Settings,
  ChevronDown,
  Inbox,
  Send,
  LogOut,
  User
} from 'lucide-react';

const TopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const timeoutRef = useRef(null);
  const userTimeoutRef = useRef(null);
  
  const userEmail = localStorage.getItem('userEmail') || 'User';
  const isOperationsActive = location.pathname === '/receipts' || location.pathname === '/deliveries';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

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
            to="/warehouses"
            className="px-4 py-2 font-medium transition-colors"
            style={location.pathname.startsWith('/warehouses') ? {
              borderBottom: '2px solid var(--accent-green)',
              color: 'var(--accent-green)'
            } : {
              color: 'var(--text-secondary)'
            }}
          >
            Warehouses
          </Link>
          
          <Link
            to="/move-history"
            className="px-4 py-2 font-medium transition-colors"
            style={location.pathname === '/move-history' ? {
              borderBottom: '2px solid var(--accent-green)',
              color: 'var(--accent-green)'
            } : {
              color: 'var(--text-secondary)'
            }}
          >
            Move History
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

          {/* User Menu */}
          <div 
            className="relative"
            onMouseEnter={() => {
              if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current);
              setUserMenuOpen(true);
            }}
            onMouseLeave={() => {
              userTimeoutRef.current = setTimeout(() => {
                setUserMenuOpen(false);
              }, 150);
            }}
          >
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ 
                backgroundColor: userMenuOpen ? 'var(--bg-primary)' : 'transparent',
                color: 'var(--text-primary)'
              }}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">{userEmail.split('@')[0]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {userMenuOpen && (
              <div 
                className="absolute right-0 w-56 rounded-lg shadow-lg overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  top: 'calc(100% + 8px)',
                  zIndex: 1000
                }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Signed in as
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {userEmail}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full transition-colors text-red-600"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
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
