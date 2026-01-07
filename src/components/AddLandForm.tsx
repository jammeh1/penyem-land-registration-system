import { useState, useEffect } from 'react';
import { supabase, Owner } from '../lib/supabase';
import { X, Plus } from 'lucide-react';

interface AddLandFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLandForm({ onClose, onSuccess }: AddLandFormProps) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddOwner, setShowAddOwner] = useState(false);

  const [formData, setFormData] = useState({
    land_number: '',
    location: '',
    area_size: '',
    boundaries: '',
    original_owner_id: '',
    current_owner_id: '',
  });

  const [newOwner, setNewOwner] = useState({
    full_name: '',
    national_id: '',
    contact_number: '',
    address: '',
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  async function fetchOwners() {
    const { data, error } = await supabase
      .from('owners')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching owners:', error);
    } else {
      setOwners(data || []);
    }
  }

  async function handleAddOwner() {
    if (!newOwner.full_name) {
      alert('Please enter owner name');
      return;
    }

    const { data, error } = await supabase
      .from('owners')
      .insert([newOwner])
      .select()
      .single();

    if (error) {
      alert('Error adding owner: ' + error.message);
    } else {
      setOwners([...owners, data]);
      setNewOwner({ full_name: '', national_id: '', contact_number: '', address: '' });
      setShowAddOwner(false);
      alert('Owner added successfully!');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.land_number || !formData.location || !formData.area_size) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const landData = {
        land_number: formData.land_number,
        location: formData.location,
        area_size: parseFloat(formData.area_size),
        boundaries: formData.boundaries || null,
        original_owner_id: formData.original_owner_id || null,
        current_owner_id: formData.current_owner_id || formData.original_owner_id || null,
      };

      const { data: land, error: landError } = await supabase
        .from('lands')
        .insert([landData])
        .select()
        .single();

      if (landError) throw landError;

      if (formData.original_owner_id) {
        const { error: transferError } = await supabase
          .from('ownership_transfers')
          .insert([{
            land_id: land.id,
            from_owner_id: null,
            to_owner_id: formData.original_owner_id,
            transfer_date: new Date().toISOString().split('T')[0],
            transfer_notes: 'Initial land registration',
          }]);

        if (transferError) throw transferError;
      }

      alert('Land registered successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Error registering land: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Register New Land</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Land Number *
            </label>
            <input
              type="text"
              required
              value={formData.land_number}
              onChange={(e) => setFormData({ ...formData, land_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., PLOT-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., North sector, near village center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area Size (m²) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.area_size}
              onChange={(e) => setFormData({ ...formData, area_size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Boundaries
            </label>
            <textarea
              value={formData.boundaries}
              onChange={(e) => setFormData({ ...formData, boundaries: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the land boundaries..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Original Owner
              </label>
              <button
                type="button"
                onClick={() => setShowAddOwner(!showAddOwner)}
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
              >
                <Plus size={16} />
                Add New Owner
              </button>
            </div>

            {showAddOwner && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newOwner.full_name}
                  onChange={(e) => setNewOwner({ ...newOwner, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="National ID"
                  value={newOwner.national_id}
                  onChange={(e) => setNewOwner({ ...newOwner, national_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={newOwner.contact_number}
                  onChange={(e) => setNewOwner({ ...newOwner, contact_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newOwner.address}
                  onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddOwner}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Owner
                </button>
              </div>
            )}

            <select
              value={formData.original_owner_id}
              onChange={(e) => setFormData({
                ...formData,
                original_owner_id: e.target.value,
                current_owner_id: formData.current_owner_id || e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select original owner...</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.full_name} {owner.national_id && `(ID: ${owner.national_id})`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Land'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
