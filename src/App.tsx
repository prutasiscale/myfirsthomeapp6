import React, { useState, useEffect, useCallback } from 'react';
import HostTable from './components/HostTable';
import WidgetContainer from './components/WidgetContainer';
import WorldClocks from './components/WorldClocks';
import { fetchConfig, fetchInventory } from './utils/api';
import { Config, Inventory } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [selectedHost, setSelectedHost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHomeEnvironment, setIsHomeEnvironment] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [configData, inventoryData] = await Promise.all([fetchConfig(isHomeEnvironment), fetchInventory(isHomeEnvironment)]);
      console.log('Config:', configData);
      console.log('Inventory:', inventoryData);
      setConfig(configData);
      setInventory(inventoryData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError((err as Error).message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [isHomeEnvironment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleHostSelect = (host: string) => {
    setSelectedHost(host);
  };

  const handleRetry = () => {
    loadData();
  };

  const toggleEnvironment = () => {
    setIsHomeEnvironment(!isHomeEnvironment);
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={handleRetry}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!config || !inventory) {
    return <div className="text-center mt-8">No data available. Please check your server connection and try again.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 flex flex-col">
      <div className="max-w-7xl mx-auto w-full mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ansible Dashboard</h1>
        <div className="flex items-center">
          <span className="mr-2">Sample</span>
          <label className="switch">
            <input type="checkbox" checked={isHomeEnvironment} onChange={toggleEnvironment} />
            <span className="slider round"></span>
          </label>
          <span className="ml-2">Home</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto space-y-4 flex-grow">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <HostTable
            inventory={inventory}
            onHostSelect={handleHostSelect}
          />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <WidgetContainer
            config={config}
            selectedHost={selectedHost}
            isHomeEnvironment={isHomeEnvironment}
          />
        </div>
      </div>
      <div className="mt-4">
        <WorldClocks />
      </div>
    </div>
  );
};

export default App;