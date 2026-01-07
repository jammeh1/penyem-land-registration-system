import { useState, useEffect } from 'react';
import { supabase, OwnershipTransfer, Owner, Land } from '../lib/supabase';
import { ArrowRight, Calendar, DollarSign, FileText } from 'lucide-react';

interface OwnershipHistoryProps {
  land: Land & { original_owner?: Owner; current_owner?: Owner };
  onTransfer: () => void;
  onGenerateDocument: () => void;
}

interface TransferWithOwners extends OwnershipTransfer {
  from_owner?: Owner | null;
  to_owner?: Owner;
}

export default function OwnershipHistory({ land, onTransfer, onGenerateDocument }: OwnershipHistoryProps) {
  const [transfers, setTransfers] = useState<TransferWithOwners[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransfers();
  }, [land.id]);

  async function fetchTransfers() {
    try {
      const { data, error } = await supabase
        .from('ownership_transfers')
        .select(`
          *,
          from_owner:owners!ownership_transfers_from_owner_id_fkey(id, full_name, national_id, contact_number, address, created_at),
          to_owner:owners!ownership_transfers_to_owner_id_fkey(id, full_name, national_id, contact_number, address, created_at)
        `)
        .eq('land_id', land.id)
        .order('transfer_date', { ascending: true });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Land Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Land Number</p>
            <p className="font-semibold text-gray-800">{land.land_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Area Size</p>
            <p className="font-semibold text-gray-800">{land.area_size} m²</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-semibold text-gray-800">{land.location}</p>
          </div>
          {land.boundaries && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Boundaries</p>
              <p className="font-semibold text-gray-800">{land.boundaries}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Original Owner</p>
            <p className="font-semibold text-gray-800">
              {land.original_owner?.full_name || 'Not recorded'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Current Owner</p>
            <p className="font-semibold text-gray-800">
              {land.current_owner?.full_name || 'Not assigned'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onTransfer}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight size={20} />
            Transfer Ownership
          </button>
          <button
            onClick={onGenerateDocument}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText size={20} />
            Generate Document
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Ownership History</h3>
        {loading ? (
          <p className="text-gray-600">Loading history...</p>
        ) : transfers.length === 0 ? (
          <p className="text-gray-600">No ownership transfers recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer, index) => (
              <div
                key={transfer.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar size={16} />
                  <span>{new Date(transfer.transfer_date).toLocaleDateString()}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">Transfer #{index + 1}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-800">
                  <span className="font-semibold">
                    {transfer.from_owner?.full_name || 'Original Owner'}
                  </span>
                  <ArrowRight size={20} className="text-blue-600" />
                  <span className="font-semibold">
                    {transfer.to_owner?.full_name}
                  </span>
                </div>
                {transfer.sale_amount && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <DollarSign size={16} />
                    <span>Sale Amount: ${transfer.sale_amount.toLocaleString()}</span>
                  </div>
                )}
                {transfer.transfer_notes && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    Note: {transfer.transfer_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
