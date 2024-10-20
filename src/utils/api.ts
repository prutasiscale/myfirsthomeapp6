import axios from 'axios';
import { Config, Inventory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.197:9998';

const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  let errorMessage = 'An unknown error occurred';
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error('Error response:', error.response);
      errorMessage = `API error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`;
    } else if (error.request) {
      console.error('Error request:', error.request);
      errorMessage = 'No response received from server. Please check your network connection and server status.';
    } else {
      console.error('Error message:', error.message);
      errorMessage = 'Error setting up the request. Please check your network connection and try again.';
    }
  }
  return errorMessage;
};

const mockConfig: Config = {
  api: { host: 'localhost', port: 3000 },
  inventory_path: '/etc/ansible/inventory.ini',
  widgets: {
    status: { script_path: '/etc/ansible/playbooks/status.yml' },
    services: { script_path: '/etc/ansible/playbooks/nmap.yml' },
    cpu: { script_path: '/etc/ansible/playbooks/cpu_usage.yml' },
    ram: { script_path: '/etc/ansible/playbooks/check_ram_usage.yml' },
    disk: { script_path: '/etc/ansible/playbooks/chk_rt_var.yml' }
  }
};

const mockInventory: Inventory = {
  nuc_sensors: {
    hosts: {
      '192.168.1.204': { ansible_host: '192.168.1.204', ansible_user: 'pruta', ansible_become_pass: '******', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519' },
      '192.168.1.206': { ansible_host: '192.168.1.206', ansible_user: 'pruta', ansible_become_pass: '******', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519' }
    }
  },
  elasticsearch: {
    hosts: {
      '192.168.1.210': { ansible_host: '192.168.1.210', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.211': { ansible_host: '192.168.1.211', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.212': { ansible_host: '192.168.1.212', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.213': { ansible_host: '192.168.1.213', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.230': { ansible_host: '192.168.1.230', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.231': { ansible_host: '192.168.1.231', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.240': { ansible_host: '192.168.1.240', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' },
      '192.168.1.241': { ansible_host: '192.168.1.241', ansible_user: 'pruta', ansible_ssh_private_key_file: '/etc/ansible/.ssh/id_ed25519', ansible_become_pass: '******' }
    }
  },
  // ... (rest of the mock inventory)
};

export const fetchConfig = async (isHomeEnvironment: boolean): Promise<Config> => {
  if (!isHomeEnvironment) {
    return mockConfig;
  }

  try {
    console.log('Fetching config from:', `${API_BASE_URL}/config`);
    const response = await axios.get(`${API_BASE_URL}/config`, { timeout: 5000 });
    console.log('Config response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching config:', error);
    throw new Error(handleApiError(error));
  }
};

export const fetchInventory = async (isHomeEnvironment: boolean): Promise<Inventory> => {
  if (!isHomeEnvironment) {
    return mockInventory;
  }

  try {
    console.log('Fetching inventory from:', `${API_BASE_URL}/inventory`);
    const response = await axios.get(`${API_BASE_URL}/inventory`, { timeout: 5000 });
    console.log('Inventory response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw new Error(handleApiError(error));
  }
};

export const fetchWidgetData = async (scriptPath: string, host: string, isHomeEnvironment: boolean): Promise<any> => {
  if (!isHomeEnvironment) {
    return getMockWidgetData(scriptPath);
  }

  try {
    console.log('Fetching widget data from:', `${API_BASE_URL}/widget/${encodeURIComponent(scriptPath)}`, 'for host:', host);
    const response = await axios.get(`${API_BASE_URL}/widget/${encodeURIComponent(scriptPath)}`, {
      params: { host },
      timeout: 5000
    });
    console.log('Widget data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching widget data:', error);
    throw new Error(handleApiError(error));
  }
};

function getMockWidgetData(scriptPath: string): any {
  if (scriptPath.includes('chk_rt_var')) {
    return {
      disk_usage: {
        stdout_lines: [
          "Filesystem                         Size  Used Avail Use% Mounted on",
          "/dev/mapper/ubuntu--vg-ubuntu--lv   98G   17G   77G  18% /",
          "/dev/mapper/ubuntu--vg-lv--0       2.8T  2.4T  318G  89% /var"
        ]
      }
    };
  } else if (scriptPath.includes('check_ram_usage')) {
    return {
      ram_usage_percent: { stdout: (Math.random() * 100).toFixed(2) },
      total_ram_gb: { stdout: "30" },
      available_ram_mb: { stdout: (Math.random() * 30000).toFixed(0) }
    };
  } else if (scriptPath.includes('cpu_usage')) {
    return {
      cpu_usage: { stdout: (Math.random() * 100).toFixed(2) }
    };
  } else if (scriptPath.includes('nmap')) {
    return {
      nmap_result: { stdout: "22/tcp open  ssh\n80/tcp open  http\n443/tcp open https" }
    };
  } else if (scriptPath.includes('status')) {
    return {
      status: { 
        stdout: Math.random() > 0.9 ? "DOWN" : "UP - Uptime: 39 days, 15:01, 1 user, load average: 0.26, 0.25, 0.28" 
      }
    };
  }
  return { status: 'Mock data for ' + scriptPath };
}