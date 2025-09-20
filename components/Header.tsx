
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAppContext();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
       <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 flex justify-end items-center space-x-4">
        <div className="text-right">
          <p className="font-semibold text-slate-800">{user?.name}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
