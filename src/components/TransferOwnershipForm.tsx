import { useState, useEffect } from 'react';
import { supabase, Owner, Land } from '../lib/supabase';
import { X, Plus } from 'lucide-react';

interface TransferOwnershipFormProps {
  land: Land & { current_owner?: Owner };
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferOwnershipForm({ land, onClose, onSuccess }: TransferOwnershipFormProps) {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddOwner, setShowAddOwner] = useState(false);

  const [formData, setFormData] = useState({
    to_owner_id: '',
    transfer_date: new Date().toISOString().split('T')[0],
    sale_amount: '',
    transfer_notes: '',
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

    if (!formData.to_owner_id) {
      alert('Please select a new owner');
      return;
    }

    if (formData.to_owner_id === land.current_owner_id) {
      alert('The selected owner is already the current owner');
      return;
    }

    setLoading(true);

    try {
      const transferData = {
        land_id: land.id,
        from_owner_id: land.current_owner_id,
        to_owner_id: formData.to_owner_id,
        transfer_date: formData.transfer_date,
        sale_amount: formData.sale_amount ? parseFloat(formData.sale_amount) : null,
        transfer_notes: formData.transfer_notes || null,
      };

      const { error: transferError } = await supabase
        .from('ownership_transfers')
        .insert([transferData]);

      if (transferError) throw transferError;

      const { error: updateError } = await supabase
        .from('lands')
        .update({ current_owner_id: formData.to_owner_id })
        .eq('id', land.id);

      if (updateError) throw updateError;

      alert('Ownership transferred successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert('Error transferring ownership: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Transfer Ownership</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800 mb-2">Land Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Land Number:</span>
              <span className="ml-2 font-medium">{land.land_number}</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <span className="ml-2 font-medium">{land.location}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Current Owner:</span>
              <span className="ml-2 font-medium">
                {land.current_owner?.full_name || 'Not assigned'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                New Owner *
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
              required
              value={formData.to_owner_id}
              onChange={(e) => setFormData({ ...formData, to_owner_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select new owner...</option>
              {owners
                .filter(owner => owner.id !== land.current_owner_id)
                .map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name} {owner.national_id && `(ID: ${owner.national_id})`}
                  </option>
                ))
              }
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer Date *
            </label>
            <input
              type="date"
              required
              value={formData.transfer_date}
              onChange={(e) => setFormData({ ...formData, transfer_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sale Amount (optional)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.sale_amount}
              onChange={(e) => setFormData({ ...formData, sale_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter sale amount if applicable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transfer Notes
            </label>
            <textarea
              value={formData.transfer_notes}
              onChange={(e) => setFormData({ ...formData, transfer_notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes about this transfer..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Transferring...' : 'Transfer Ownership'}
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
