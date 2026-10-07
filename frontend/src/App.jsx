import { useState, useEffect, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import MineDetailsPanel from './components/MineDetailsPanel';
import AnalysisPage from './components/AnalysisPage';
import { AdminPageAsync } from './components/AdminPageAsync';
import SearchBar from './components/SearchBar';
import MinesList from './components/MinesList';
import { getMinesData } from './utils/dataLoader';


function App() {
  const [allMines, setAllMines] = useState([]);
  const [selectedMine, setSelectedMine] = useState(null);
  const [analyzingMine, setAnalyzingMine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Load mines data on mount
  useEffect(() => {
    try {
      const minesData = getMinesData();
      setAllMines(minesData.features);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading mines data:', error);
      setIsLoading(false);
    }
  }, []);

  // Filter mines based on search term and state
  const filteredMines = useMemo(() => {
    return allMines.filter((mine) => {
      const { display_name, mine_id, state, district } = mine.properties;
      const searchLower = searchTerm.toLowerCase();

      // Search by mine ID, name, state, or district
      const matchesSearch =
        searchTerm === '' ||
        mine_id.toString().includes(searchTerm) ||
        display_name.toLowerCase().includes(searchLower) ||
        state.toLowerCase().includes(searchLower) ||
        district.toLowerCase().includes(searchLower);

      // Filter by state
      const matchesState = selectedState === '' || state === selectedState;

      return matchesSearch && matchesState;
    });
  }, [allMines, searchTerm, selectedState]);

  // Get unique states for filter
  const states = useMemo(() => {
    return [...new Set(allMines.map((mine) => mine.properties.state))].sort();
  }, [allMines]);

  const handleMineSelect = (mine) => {
    setSelectedMine(mine);
  };

  const handleAnalysis = (mine) => {
    setAnalyzingMine(mine);
  };

  const handleBackFromAnalysis = () => {
    setAnalyzingMine(null);
  };

  // If analyzing a mine, show the analysis page
  if (analyzingMine) {
    return <AnalysisPage mine={analyzingMine} onBack={handleBackFromAnalysis} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F7F6F4]">
      {/* Header */}
      <Header totalMines={allMines.length} onAdminClick={() => setShowAdmin(true)} />

      {/* Admin Modal */}
      {showAdmin && <AdminPageAsync onClose={() => setShowAdmin(false)} />}

      {/* Main Content - Map Takes Full Width */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Search & List */}
        {showSidebar && (
          <div className="w-80 bg-white overflow-y-auto flex flex-col border-r border-[#E4E2DE] custom-scrollbar">
            {/* Hide Button */}
            <div className="p-2 border-b border-[#E4E2DE]">
              <button
                onClick={() => setShowSidebar(false)}
                className="w-full px-3 py-1.5 bg-[#F7F6F4] hover:bg-white text-[#3A5F7D] border border-[#E4E2DE] rounded text-xs font-medium transition"
              >
                ◀ Hide
              </button>
            </div>

            <div className="p-0">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedState={selectedState}
                onStateChange={setSelectedState}
                states={states}
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-3">
                <h3 className="font-semibold text-[#1F2328] mb-3 text-sm">
                  Found {filteredMines.length} mine{filteredMines.length !== 1 ? 's' : ''}
                </h3>
                <MinesList
                  mines={filteredMines}
                  selectedMine={selectedMine}
                  onMineSelect={handleMineSelect}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toggle Sidebar Button - Only show when sidebar is hidden */}
        {!showSidebar && (
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 left-4 z-20 bg-white hover:bg-[#F7F6F4] text-[#3A5F7D] border border-[#E4E2DE] px-3 py-2 mt-12 rounded text-sm font-medium transition shadow-sm"
          >
            ▶ Search
          </button>
        )}

        {/* Full Screen Map */}
        <div className="flex-1">
          <MapComponent
            mines={filteredMines}
            selectedMine={selectedMine}
            onMineSelect={handleMineSelect}
            isLoading={isLoading}
          />
        </div>

        {/* Floating Details Panel - HIDDEN when Admin is open */}
        {selectedMine && !showAdmin && (
          <MineDetailsPanel
            mine={selectedMine}
            onClose={() => setSelectedMine(null)}
            onAnalysis={handleAnalysis}
          />
        )}
      </div>
    </div>
  );
}

export default App;
