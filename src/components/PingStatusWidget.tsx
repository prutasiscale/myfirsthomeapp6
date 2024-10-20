import React, { useState, useEffect } from 'react';
import { Inventory } from '../types';

interface PingStatusWidgetProps {
  inventory: Inventory;
  selectedHost: string | null;
}

const PingStatusWidget: React.FC<PingStatusWidgetProps> = ({ inventory, selectedHost }) => {
  const [pingStatus, setPingStatus] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const updatePingStatus = () => {
      const newStatus: {[key: string]: boolean} = {};
      Object.values(inventory).forEach(group => {
        Object.keys(group.hosts).forEach(host => {
          // Simulate ping status (replace with actual ping logic in production)
          newStatus[host] = Math.random() > 0.1; // 90% chance of being up
        });
      });
      setPingStatus(newStatus);
    };

    updatePingStatus();
    const interval = setInterval(updatePingStatus, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, [inventory]);

  if (!selectedHost) {
    return (
      <div className="bg-white rounded-lg shadow p-2 text-xs">
        <h3 className="font-semibold mb-1">Ping Status</h3>
        <p>Select a host to view ping status</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-2 text-xs">
      <h3 className="font-semibold mb-1">Ping Status</h3>
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full mr-1 ${pingStatus[selectedHost] ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{selectedHost}: {pingStatus[selectedHost] ? 'Up' : 'Down'}</span>
      </div>
    </div>
  );
};

export default PingStatusWidget;