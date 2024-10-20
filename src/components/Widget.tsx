import React, { useState, useEffect } from 'react';
import { fetchWidgetData } from '../utils/api';
import { Cpu, Server, Activity, MemoryStick, Clock, TrendingUp, User, HardDrive } from 'lucide-react';

interface WidgetProps {
  name: string;
  scriptPath: string;
  selectedHost: string | null;
  isHomeEnvironment: boolean;
}

const Widget: React.FC<WidgetProps> = ({ name, scriptPath, selectedHost, isHomeEnvironment }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedHost) {
      setLoading(true);
      setError(null);
      fetchWidgetData(scriptPath, selectedHost, isHomeEnvironment)
        .then(setData)
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    } else {
      setData(null);
      setError(null);
    }
  }, [scriptPath, selectedHost, isHomeEnvironment]);

  const renderHorizontalBar = (label: string, used: number, total: number, unit: string, icon: React.ReactNode) => {
    const percentage = (used / total) * 100;
    const isWarning = percentage > 90;
    const barColor = isWarning ? 'bg-red-500' : 'bg-green-500';
    const textColor = isWarning ? 'text-red-700' : 'text-green-700';

    return (
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium flex items-center">
            {icon}
            <span className="ml-1">{label}</span>
          </span>
          <span className={`text-xs ${textColor}`}>
            {used.toFixed(1)} / {total.toFixed(1)} {unit} ({percentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${barColor} h-2 rounded-full`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderDiskUsage = (usage: any) => {
    if (!usage || !usage.disk_usage || !usage.disk_usage.stdout_lines) {
      return <p>No disk usage data available</p>;
    }

    const diskData = usage.disk_usage.stdout_lines.slice(1).map((line: string) => {
      const [filesystem, size, used, avail, usePercent, mountpoint] = line.split(/\s+/);
      return { filesystem, size, used, avail, usePercent, mountpoint };
    });

    return (
      <div>
        {diskData.map((disk: any, index: number) => {
          const total = parseFloat(disk.size);
          const used = parseFloat(disk.used);
          return (
            <div key={`disk-${index}`}>
              {renderHorizontalBar(disk.mountpoint, used, total, 'GB', <HardDrive size={14} />)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRAMUsage = (usage: any) => {
    if (!usage || !usage.ram_usage_percent || !usage.total_ram_gb || !usage.available_ram_mb) {
      return <p>No RAM usage data available</p>;
    }
    const usagePercent = parseFloat(usage.ram_usage_percent.stdout);
    const totalRAM = parseFloat(usage.total_ram_gb.stdout);
    const availableRAM = parseFloat(usage.available_ram_mb.stdout) / 1024;
    const usedRAM = totalRAM - availableRAM;

    return (
      <div>
        {renderHorizontalBar('RAM', usedRAM, totalRAM, 'GB', <MemoryStick size={14} />)}
      </div>
    );
  };

  const renderCPUUsage = (usage: any) => {
    if (!usage || !usage.cpu_usage) {
      return <p>No CPU usage data available</p>;
    }
    const cpuUsage = parseFloat(usage.cpu_usage.stdout);
    return renderHorizontalBar('CPU', cpuUsage, 100, '%', <Cpu size={14} />);
  };

  const renderServices = (services: any) => {
    if (!services || !services.nmap_result || !services.nmap_result.stdout) {
      return <p>No services data available</p>;
    }
    const serviceLines = services.nmap_result.stdout.split('\n');
    return (
      <div>
        {serviceLines.map((line: string, index: number) => {
          const [port, status, service] = line.split(/\s+/);
          return (
            <div key={`service-${index}`} className="flex items-center mb-1">
              <Server size={14} className="mr-1" />
              <span className="text-xs">{port} - <span className="text-blue-600">{service}</span></span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStatus = (status: any) => {
    if (!status || !status.status || !status.status.stdout) {
      return <p>No status data available</p>;
    }
    const statusInfo = status.status.stdout.split(' - ');
    const isUp = statusInfo[0] === "UP";
    return (
      <div>
        <div className={`flex items-center ${isUp ? 'text-green-600' : 'text-red-600'} mb-1`}>
          <Activity size={14} className="mr-1" />
          <span className="text-xs font-semibold">{statusInfo[0]}</span>
        </div>
        {statusInfo[1] && (
          <div className="text-xs">
            <Clock size={14} className="inline mr-1" />
            <span className="text-blue-600">{statusInfo[1]}</span>
          </div>
        )}
        {statusInfo[2] && (
          <div className="text-xs">
            <User size={14} className="inline mr-1" />
            {statusInfo[2]}
          </div>
        )}
        {statusInfo[3] && (
          <div className="text-xs">
            <TrendingUp size={14} className="inline mr-1" />
            {statusInfo[3]}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <p className="text-gray-500">Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!data) return <p className="text-gray-500">No data available</p>;

    switch (name.toLowerCase()) {
      case 'disk':
        return renderDiskUsage(data);
      case 'ram':
        return renderRAMUsage(data);
      case 'cpu':
        return renderCPUUsage(data);
      case 'services':
        return renderServices(data);
      case 'status':
        return renderStatus(data);
      default:
        return <pre className="overflow-auto max-h-24 text-xs">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold capitalize">{name}</h3>
        {selectedHost && (
          <span className="text-blue-600 text-[10px]">{selectedHost}</span>
        )}
      </div>
      {selectedHost ? renderContent() : <p className="text-gray-500">Select a host to view data</p>}
    </div>
  );
};

export default Widget;