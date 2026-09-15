const fs = require('fs');
const path = 'c:/Users/ASUS/Desktop/Sunset home/src/pages/customer/CustomerApp.tsx';
let content = fs.readFileSync(path, 'utf8');
// Replace Navbar function
const newNavbar = `function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const isHome = location.pathname === '/' || location.pathname === '';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = !isHome || scrolled;

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ${isSolid ? 'bg-white shadow-sm border-b border-gray-100 py-2 text-gray-900' : 'bg-transparent py-3 text-white'}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left - Logo */}
        <Link to="/" className="flex-shrink-0 flex flex-col">
          <h1 className="text-xl md:text-2xl font-serif tracking-[0.25em] uppercase font-light">Sunset</h1>
          <span className="text-[9px] uppercase tracking-[0.3em] opacity-70 mt-1">Boutique Homestay</span>
        </Link>

        {/* Center - Navigation (md+) */}
        <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link to="/" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">Trang chủ</Link>
          <Link to="/policies" className="text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">Chính sách</Link>
        </div>

        {/* Right - Action */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center space-x-1 text-sm hover:text-yellow-500 transition-colors">
                <UserIcon size={16} />
                <span className="hidden md:inline font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
              </Link>
              {localStorage.getItem('auth_role') === 'admin' && (
                <Link to="/admin" className="flex items-center text-[11px] uppercase tracking-[0.2em] font-bold text-purple-600 hover:text-purple-700 transition-colors ml-2">
                  [ VÀO ADMIN ]
                </Link>
              )}
              {localStorage.getItem('auth_role') === 'staff' && (
                <Link to="/staff" className="flex items-center text-[11px] uppercase tracking-[0.2em] font-bold text-blue-600 hover:text-blue-700 transition-colors ml-2">
                  [ LỄ TÂN ]
                </Link>
              )}
            </>
          ) : (
            <Link to="/login" className="flex items-center text-[11px] uppercase tracking-[0.2em] font-medium hover:text-yellow-500 transition-colors">
              <UserIcon size={16} className="md:hidden" />
              <span className="hidden md:block">Đăng nhập</span>
            </Link>
          )}
          <Link
            to="/booking"
            className={`px-4 py-2 md:px-6 md:py-3 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-300 border animate-[pulse_3s_infinite] hover:animate-none w-full sm:w-auto ${
              isSolid
                ? 'bg-[#1C1A17] text-white border-[#1C1A17] hover:bg-yellow-600 hover:border-yellow-600 shadow-md hover:shadow-[0_0_20px_rgba(202,138,4,0.4)] hover:-translate-y-0.5'
                : 'bg-white/10 backdrop-blur-md text-white border-white/50 hover:bg-white hover:text-[#1C1A17] shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
            }`}
          >
            Đặt Phòng
          </Link>
        </div>
      </div>
    </nav>
  );
}`;

// Replace existing Navbar function (from line starting with "function Navbar" to the closing brace before next function)
content = content.replace(/function Navbar\s*\([\s\S]*?\}\n\)/, newNavbar);
fs.writeFileSync(path, content);
console.log('CustomerApp Navbar updated for responsive layout');
