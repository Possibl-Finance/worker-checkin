import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Building2, Users, Phone, BarChart3, Settings, Search, Bell, User, ChevronDown } from 'lucide-react';

interface SimpleAdminLayoutProps {
  children: ReactNode;
}

export default function SimpleAdminLayout({ children }: SimpleAdminLayoutProps) {
  const router = useRouter();

  const isActive = (path: string) => {
    return router.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Dark Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-shrink-0 h-screen sticky top-0 flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-orange-500 text-white flex items-center justify-center rounded-md">
              <span className="font-bold text-base">W</span>
            </div>
            <span className="font-semibold text-lg text-white">Junify</span>
          </Link>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-8 space-y-1.5">
            <Link 
              href="/admin" 
              className={`flex items-center px-4 py-2.5 rounded-md text-sm ${router.pathname === '/admin' ? 'bg-gray-800 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            
            <Link 
              href="/admin/workers" 
              className={`flex items-center px-4 py-2.5 rounded-md text-sm ${isActive('/admin/workers') ? 'bg-gray-800 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <Users className="h-5 w-5 mr-3" />
              Workers
            </Link>
            
            <Link 
              href="/admin/calls" 
              className={`flex items-center px-4 py-2.5 rounded-md text-sm ${isActive('/admin/calls') ? 'bg-gray-800 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <Phone className="h-5 w-5 mr-3" />
              Calls
            </Link>
            
            <Link 
              href="/admin/reports" 
              className={`flex items-center px-4 py-2.5 rounded-md text-sm ${isActive('/admin/reports') ? 'bg-gray-800 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Reports
            </Link>
          </div>
          
          {/* Projects Section */}
          <div className="mb-8">
            <div className="px-4 py-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Projects</span>
            </div>
            
            <div className="space-y-1.5">
              <div className="px-4 py-2.5 rounded-md text-sm text-white bg-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mr-3"></div>
                  <span>Blackwood project</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              
              <div className="px-4 py-2.5 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
                  <span>Eastside Construction</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings */}
          <div className="mb-8">
            <div className="px-4 py-2 mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Settings</span>
            </div>
            
            <Link 
              href="/admin/settings" 
              className={`flex items-center px-4 py-2.5 rounded-md text-sm ${isActive('/admin/settings') ? 'bg-gray-800 text-white font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <Settings className="h-5 w-5 mr-3" />
              General Settings
            </Link>
          </div>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-800 flex items-center">
          <div className="h-10 w-10 bg-gray-700 text-white rounded-full flex items-center justify-center mr-3">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">John Appleseed</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
            <div className="h-8 w-8 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
              <span className="font-medium text-sm">JA</span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
