import { useState, useEffect } from 'react';
import { supabase, Land, Owner, OwnershipTransfer } from '../lib/supabase';
import { X, Printer, Download } from 'lucide-react';

interface LandDocumentProps {
  land: Land & { original_owner?: Owner; current_owner?: Owner };
  onClose: () => void;
}

interface TransferWithOwners extends OwnershipTransfer {
  from_owner?: Owner | null;
  to_owner?: Owner;
}

export default function LandDocument({ land, onClose }: LandDocumentProps) {
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

  function handlePrint() {
    window.print();
  }

  const lastTransfer = transfers[transfers.length - 1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b print:hidden bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Land Ownership Certificate</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer size={20} />
              Print
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 bg-blue-50 min-h-screen" style={{ fontFamily: 'Georgia, serif' }}>
          <div className="bg-white p-12 space-y-6" style={{ pageBreakAfter: 'avoid' }}>
            <div className="text-center border-b-4 border-blue-900 pb-6">
              <div className="w-12 h-12 mx-auto mb-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-blue-900">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-700 font-semibold tracking-wider">PENYEM VILLAGE</p>
              <p className="text-sm text-gray-700 font-semibold">Kombo Central District</p>
              <p className="text-sm text-gray-700 font-semibold">West Coast Region</p>
              <p className="text-sm text-gray-600 mt-3">
                Date: {new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).replace(/\//g, '-')}
              </p>
            </div>

            <div className="text-center border-b-4 border-blue-900 pb-6">
              <h1 className="text-2xl font-bold text-blue-900 tracking-widest">CERTIFICATE OF LAND OWNERSHIP</h1>
            </div>

            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p className="text-lg">
                <span className="font-bold">Mr./Mrs./Me:</span>{' '}
                <span className="underline inline-block w-64 text-center">
                  {land.original_owner?.full_name || '_________________'}
                </span>{' '}
                <span className="font-bold">of</span>{' '}
                <span className="underline inline-block w-64 text-center">
                  {land.original_owner?.address || '_________________'}
                </span>
              </p>

              <p className="text-lg">
                is hereby transferring part of my plot of compound situated at{' '}
                <span className="font-bold">PENYEM VILLAGE</span> to:
              </p>

              <p className="text-lg">
                <span className="font-bold">One:</span>{' '}
                <span className="underline inline-block w-64 text-center">
                  {land.current_owner?.full_name || '_________________'}
                </span>{' '}
                <span className="font-bold">of</span>{' '}
                <span className="underline inline-block w-64 text-center">
                  {land.current_owner?.address || '_________________'}
                </span>
              </p>

              <p className="text-lg">
                with effect from today the{' '}
                <span className="underline inline-block w-40 text-center">
                  {transfers[0]?.transfer_date ? new Date(transfers[0].transfer_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '-') : '_____________'}
                </span>
              </p>

              <p className="text-lg">
                The dimension of the said plot of land or compound now is:{' '}
                <span className="underline inline-block w-64 text-center">
                  {land.area_size} sq m
                </span>
              </p>

              <p className="text-lg">
                The said plot of land or compound now belong to{' '}
                <span className="font-bold">Mr./Mrs./Me:</span>{' '}
                <span className="underline inline-block w-64 text-center">
                  {land.current_owner?.full_name || '_________________'}
                </span>{' '}
                <span className="font-bold">legally.</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 mt-12">
              <div>
                <p className="font-bold text-lg mb-12">Signature of the person handing over</p>
                <div className="border-t-2 border-gray-800 mb-2"></div>
                <p className="text-sm font-semibold">Name:</p>
                <p className="text-sm underline">{land.original_owner?.full_name || '_________________'}</p>
                <p className="text-sm font-semibold mt-2">Signature:</p>
                <p className="text-sm underline mt-6">_________________</p>
                <p className="text-sm font-semibold mt-4">Address:</p>
                <p className="text-sm underline">{land.original_owner?.address || '_________________'}</p>
                <p className="text-sm font-semibold mt-2">Telephone:</p>
                <p className="text-sm underline">{land.original_owner?.contact_number || '_________________'}</p>
              </div>

              <div>
                <p className="font-bold text-lg mb-12">Signature of the person taking over</p>
                <div className="border-t-2 border-gray-800 mb-2"></div>
                <p className="text-sm font-semibold">Name:</p>
                <p className="text-sm underline">{land.current_owner?.full_name || '_________________'}</p>
                <p className="text-sm font-semibold mt-2">Signature:</p>
                <p className="text-sm underline mt-6">_________________</p>
                <p className="text-sm font-semibold mt-4">Address:</p>
                <p className="text-sm underline">{land.current_owner?.address || '_________________'}</p>
                <p className="text-sm font-semibold mt-2">Telephone:</p>
                <p className="text-sm underline">{land.current_owner?.contact_number || '_________________'}</p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-gray-400">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-bold mb-6">Witness</p>
                  <p className="text-sm font-semibold">Name:</p>
                  <p className="text-sm underline h-6"></p>
                  <p className="text-sm font-semibold mt-2">Signature:</p>
                  <p className="text-sm underline mt-6 h-6"></p>
                  <p className="text-sm font-semibold mt-4">Address:</p>
                  <p className="text-sm underline h-6"></p>
                  <p className="text-sm font-semibold mt-2">Telephone:</p>
                  <p className="text-sm underline h-6"></p>
                </div>
                <div>
                  <p className="font-bold mb-6">Witness</p>
                  <p className="text-sm font-semibold">Name:</p>
                  <p className="text-sm underline h-6"></p>
                  <p className="text-sm font-semibold mt-2">Signature:</p>
                  <p className="text-sm underline mt-6 h-6"></p>
                  <p className="text-sm font-semibold mt-4">Address:</p>
                  <p className="text-sm underline h-6"></p>
                  <p className="text-sm font-semibold mt-2">Telephone:</p>
                  <p className="text-sm underline h-6"></p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-gray-400">
              <p className="text-base text-gray-800 mb-8">
                I the Alkalo of Penyem hereby confirming the above statement with effect from today the{' '}
                <span className="underline inline-block w-40 text-center">
                  {transfers[0]?.transfer_date ? new Date(transfers[0].transfer_date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '-') : '_____________'}
                </span>
              </p>
              <div className="flex items-end gap-12">
                <div>
                  <p className="text-sm font-semibold mb-12">Alkalo Signature</p>
                  <div className="border-t-2 border-gray-800 w-40"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-8">Official Stamp</p>
                  <div className="w-32 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400">
                    [Seal]
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
