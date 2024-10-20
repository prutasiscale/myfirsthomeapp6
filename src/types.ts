export interface Host {
  ansible_host: string;
  ansible_user: string;
  ansible_become_pass?: string;
  ansible_ssh_private_key_file?: string;
}

export interface Inventory {
  [group: string]: {
    hosts: { [hostname: string]: Host };
    vars?: { [key: string]: string };
  };
}

export interface Widget {
  script_path: string;
}

export interface Config {
  api: {
    host: string;
    port: number;
  };
  inventory_path: string;
  widgets: {
    [key: string]: Widget;
  };
}