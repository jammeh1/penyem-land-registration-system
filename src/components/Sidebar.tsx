import { LayoutDashboard, FileText, Users, ArrowRightLeft, BookOpen, BarChart3, LogOut } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'records', label: 'Land Records', icon: FileText },
  { id: 'owners', label: 'Owners', icon: Users },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
  { id: 'documents', label: 'Documents', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 min-h-screen shadow-lg">
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">LR</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Land Registry</h1>
            <p className="text-blue-200 text-xs">Village Management</p>
          </div>
        </div>
      </div>

      <nav className="py-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-400 text-white shadow-md'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-blue-700 rounded-lg transition-all">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
