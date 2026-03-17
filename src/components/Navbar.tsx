import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">上</span>
            </div>
            <span className="text-xl font-bold text-gray-900">上酒吧</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              首页
            </Link>

            {user ? (
              <>
                <Link
                  to="/create"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/create') ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  发布配方
                </Link>
                <Link
                  to="/messages"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/messages') ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  私信
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">
                          {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </button>

                  {isMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        <Link
                          to={`/profile/${user?.id || 'demo-user-id'}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          我的主页
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          退出登录
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
              >
                登录
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                }`}
              >
                首页
              </Link>

              {/* 我的主页 - 无论是否登录都显示 */}
              <Link
                to={`/profile/${user?.id || 'demo-user-id'}`}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(`/profile/${user?.id || 'demo-user-id'}`) ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                }`}
              >
                我的主页
              </Link>

              {user ? (
                <>
                  <Link
                    to="/create"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/create') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    发布配方
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/messages') ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    私信
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 bg-gray-900 text-white text-base font-medium rounded-md text-center"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
