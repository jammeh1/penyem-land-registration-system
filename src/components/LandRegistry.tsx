import { useState, useEffect } from 'react';
import { supabase, Land, Owner } from '../lib/supabase';
import { FileText, Users, Plus } from 'lucide-react';

interface LandWithOwners extends Land {
  original_owner?: Owner;
  current_owner?: Owner;
}

interface LandRegistryProps {
  onSelectLand: (land: LandWithOwners) => void;
  onAddLand: () => void;
}

export default function LandRegistry({ onSelectLand, onAddLand }: LandRegistryProps) {
  const [lands, setLands] = useState<LandWithOwners[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLands();
  }, []);

  async function fetchLands() {
    try {
      const { data: landsData, error } = await supabase
        .from('lands')
        .select(`
          *,
          original_owner:owners!lands_original_owner_id_fkey(id, full_name, national_id, contact_number, address, created_at),
          current_owner:owners!lands_current_owner_id_fkey(id, full_name, national_id, contact_number, address, created_at)
        `)
        .order('land_number', { ascending: true });

      if (error) throw error;
      setLands(landsData || []);
    } catch (error) {
      console.error('Error fetching lands:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLands = lands.filter(land =>
    land.land_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    land.current_owner?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading land records...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Land Records</h1>
          <p className="text-gray-600 mt-1">Manage all village land records</p>
        </div>
        <button
          onClick={onAddLand}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add New Land
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by land number, location, or owner..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <div className="grid gap-4">
        {filteredLands.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No lands found matching your search.' : 'No lands registered yet.'}
          </div>
        ) : (
          filteredLands.map((land) => (
            <div
              key={land.id}
              onClick={() => onSelectLand(land)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="text-blue-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-800">
                      Land #{land.land_number}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-800">{land.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Area Size</p>
                      <p className="font-medium text-gray-800">{land.area_size} m²</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Users size={16} />
                        Current Owner
                      </p>
                      <p className="font-medium text-gray-800">
                        {land.current_owner?.full_name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
