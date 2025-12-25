import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="fixed top-0 w-full bg-white border-b border-slate-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">Clinical Flows</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-slate-700 hover:text-blue-600 font-medium transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/auth')}
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="bg-slate-900 text-white py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-lg font-bold">Clinical Flows</span>
            </div>
            <p className="text-slate-400 text-sm">
              Built for the Global South by Soft Hive Inc.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
