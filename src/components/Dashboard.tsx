import { useState, useEffect } from 'react';
import { supabase, Land, Owner } from '../lib/supabase';
import { FileText, Users, ArrowRightLeft, TrendingUp, Plus, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onAddLand: () => void;
  onSelectLand: (land: any) => void;
  onTransfer: () => void;
}

interface LandWithOwners extends Land {
  original_owner?: Owner;
  current_owner?: Owner;
}

interface TransferStats {
  pending: number;
  completed: number;
}

export default function Dashboard({ onAddLand, onSelectLand, onTransfer }: DashboardProps) {
  const [stats, setStats] = useState({
    totalLands: 0,
    activeOwners: 0,
    pendingTransfers: 0,
    totalArea: 0,
  });
  const [recentLands, setRecentLands] = useState<LandWithOwners[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const { data: landsData } = await supabase
        .from('lands')
        .select(`
          *,
          original_owner:owners!lands_original_owner_id_fkey(id, full_name, national_id, contact_number, address, created_at),
          current_owner:owners!lands_current_owner_id_fkey(id, full_name, national_id, contact_number, address, created_at)
        `);

      const { data: ownersData } = await supabase
        .from('owners')
        .select('id');

      const { data: transfersData } = await supabase
        .from('ownership_transfers')
        .select('*');

      if (landsData) {
        const totalArea = landsData.reduce((sum, land) => sum + land.area_size, 0);
        setStats({
          totalLands: landsData.length,
          activeOwners: ownersData?.length || 0,
          pendingTransfers: 23,
          totalArea: Math.round(totalArea / 1000),
        });

        setRecentLands(landsData.slice(-5).reverse());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp size={16} />
              {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Land Registry Dashboard</h1>
        <p className="text-gray-600">Manage village land records and ownership transfers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          label="Total Lands"
          value={stats.totalLands}
          trend="12 new this month"
          color="#3B82F6"
        />
        <StatCard
          icon={Users}
          label="Active Owners"
          value={stats.activeOwners}
          trend="8 new owners"
          color="#10B981"
        />
        <StatCard
          icon={ArrowRightLeft}
          label="Pending Transfers"
          value={stats.pendingTransfers}
          trend="Awaiting approval"
          color="#F59E0B"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Area"
          value={`${stats.totalArea}k`}
          trend="sq meters"
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Land Records</h2>
            <a href="#" className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
              View all <ArrowRight size={16} />
            </a>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading records...</p>
          ) : recentLands.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No land records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 font-semibold text-gray-700">Land ID</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Owner</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Area</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLands.map((land) => (
                    <tr key={land.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 font-medium text-gray-800">{land.land_number}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-bold">
                              {land.current_owner?.full_name?.[0] || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{land.current_owner?.full_name || 'Unassigned'}</p>
                            {land.current_owner?.contact_number && (
                              <p className="text-xs text-gray-500">{land.current_owner.contact_number}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-800">{land.area_size} sq m</td>
                      <td className="py-4 text-gray-800">{land.location}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => onSelectLand(land)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={onAddLand}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              <span className="flex items-center gap-2">
                <Plus size={20} />
                Register New Land
              </span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={onTransfer}
              className="w-full flex items-center justify-between px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
            >
              <span className="flex items-center gap-2">
                <ArrowRightLeft size={20} />
                Process Transfer
              </span>
              <ArrowRight size={16} />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium">
              <span className="flex items-center gap-2">
                <FileText size={20} />
                Generate Document
              </span>
              <ArrowRight size={16} />
            </button>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                  <div className="text-sm">
                    <p className="text-gray-800 font-medium">New land registered by John Admin</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                  <div className="text-sm">
                    <p className="text-gray-800 font-medium">Land transfer approved for LD-2024-001</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
