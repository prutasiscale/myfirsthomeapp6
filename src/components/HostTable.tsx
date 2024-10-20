import React, { useState, useEffect } from 'react';
import { Inventory } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface HostTableProps {
  inventory: Inventory;
  onHostSelect: (host: string) => void;
}

const HostTable: React.FC<HostTableProps> = ({ inventory, onHostSelect }) => {
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [hostnames, setHostnames] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchHostnames = async () => {
      const newHostnames: {[key: string]: string} = {};
      Object.entries(inventory).forEach(([group, groupData]) => {
        Object.entries(groupData.hosts).forEach(([ip, hostData]) => {
          const lastOctet = ip.split('.')[3];
          newHostnames[ip] = `${group}-${lastOctet}`;
        });
      });
      setHostnames(newHostnames);
    };

    fetchHostnames();
  }, [inventory]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <tbody>
          {Object.entries(inventory).map(([group, groupData]) => (
            <React.Fragment key={group}>
              <tr className="border-b">
                <td className="px-2 py-1 font-medium w-1/4">
                  <button
                    className="flex items-center text-left w-full"
                    onClick={() => toggleGroup(group)}
                  >
                    {expandedGroups[group] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {group}
                  </button>
                </td>
                <td className="px-2 py-1">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(groupData.hosts).map(([ip, hostData]) => (
                      <button
                        key={ip}
                        onClick={() => onHostSelect(ip)}
                        className="ios-button text-left flex items-center py-0.5 px-1 w-28 justify-between"
                        title={`User: ${hostData.ansible_user}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="font-medium text-[9px] truncate flex-grow mx-1">{hostnames[ip] || 'Loading...'}</span>
                        <span className="text-[8px] text-gray-500">{ip}</span>
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HostTable;