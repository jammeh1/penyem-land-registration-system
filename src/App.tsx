import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LandRegistry from './components/LandRegistry';
import OwnershipHistory from './components/OwnershipHistory';
import AddLandForm from './components/AddLandForm';
import TransferOwnershipForm from './components/TransferOwnershipForm';
import LandDocument from './components/LandDocument';
import { Land, Owner } from './lib/supabase';

type View = 'dashboard' | 'records' | 'owners' | 'transfers' | 'documents' | 'reports' | 'details';

interface LandWithOwners extends Land {
  original_owner?: Owner;
  current_owner?: Owner;
}

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedLand, setSelectedLand] = useState<LandWithOwners | null>(null);
  const [showAddLand, setShowAddLand] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showDocument, setShowDocument] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSelectLand(land: LandWithOwners) {
    setSelectedLand(land);
    setActiveView('details');
  }

  function handleBackToRegistry() {
    setActiveView('records');
    setSelectedLand(null);
    setRefreshKey(prev => prev + 1);
  }

  function handleViewChange(view: string) {
    setActiveView(view as View);
    setSelectedLand(null);
  }

  function handleSuccess() {
    setRefreshKey(prev => prev + 1);
    if (selectedLand) {
      window.location.reload();
    }
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <div className="flex-1">
        <main className="p-8">
          {activeView === 'dashboard' && (
            <Dashboard
              onAddLand={() => setShowAddLand(true)}
              onSelectLand={handleSelectLand}
              onTransfer={() => setShowTransfer(true)}
            />
          )}

          {activeView === 'records' && (
            <LandRegistry
              key={refreshKey}
              onSelectLand={handleSelectLand}
              onAddLand={() => setShowAddLand(true)}
            />
          )}

          {activeView === 'details' && selectedLand && (
            <div>
              <button
                onClick={handleBackToRegistry}
                className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Records
              </button>
              <OwnershipHistory
                land={selectedLand}
                onTransfer={() => setShowTransfer(true)}
                onGenerateDocument={() => setShowDocument(true)}
              />
            </div>
          )}

          {activeView === 'owners' && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Owners management page coming soon</p>
            </div>
          )}

          {activeView === 'transfers' && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Transfers management page coming soon</p>
            </div>
          )}

          {activeView === 'documents' && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Documents archive page coming soon</p>
            </div>
          )}

          {activeView === 'reports' && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Reports page coming soon</p>
            </div>
          )}
        </main>
      </div>

      {showAddLand && (
        <AddLandForm
          onClose={() => setShowAddLand(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showTransfer && selectedLand && (
        <TransferOwnershipForm
          land={selectedLand}
          onClose={() => setShowTransfer(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showDocument && selectedLand && (
        <LandDocument
          land={selectedLand}
          onClose={() => setShowDocument(false)}
        />
      )}
    </div>
  );
}

export default App;
