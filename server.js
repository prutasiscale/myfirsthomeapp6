import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 9998;

// Configure CORS
const corsOptions = {
  origin: '*', // Be cautious with this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/config', (req, res) => {
  console.log('Received request for /config');
  const config = {
    api: { host: '192.168.1.197', port: 9998 },
    inventory_path: '/etc/ansible/inventory.ini',
    widgets: {
      status: { script_path: '/etc/ansible/playbooks/status.yml' },
      services: { script_path: '/etc/ansible/playbooks/nmap.yml' },
      cpu: { script_path: '/etc/ansible/playbooks/cpu_usage.yml' },
      ram: { script_path: '/etc/ansible/playbooks/check_ram_usage.yml' },
      disk: { script_path: '/etc/ansible/playbooks/chk_rt_var.yml' }
    }
  };
  console.log('Sending config:', config);
  res.json(config);
});

app.get('/inventory', (req, res) => {
  console.log('Received request for /inventory');
  exec('ansible-inventory --list', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to fetch inventory', details: error.message });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log('Inventory stdout:', stdout);
    try {
      const inventoryData = JSON.parse(stdout);
      res.json(inventoryData);
    } catch (parseError) {
      console.error('Error parsing inventory data:', parseError);
      res.status(500).json({ error: 'Failed to parse inventory data', details: parseError.message });
    }
  });
});

app.get('/widget/:scriptPath', (req, res) => {
  const { scriptPath } = req.params;
  const { host } = req.query;

  console.log(`Received request for /widget/${scriptPath} with host: ${host}`);

  if (!scriptPath || !host) {
    console.error('Missing scriptPath or host');
    return res.status(400).json({ error: 'Missing scriptPath or host' });
  }

  const command = `ansible-playbook ${scriptPath} -i /etc/ansible/inventory.ini --limit ${host}`;
  console.log('Executing command:', command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to execute playbook', details: error.message });
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log('Widget stdout:', stdout);
    res.json({ output: stdout });
  });
});

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API server running at http://0.0.0.0:${port}`);
});