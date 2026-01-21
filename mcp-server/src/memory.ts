import fs from 'fs';
import path from 'path';
import os from 'os';

export interface MemoryEntry {
  key: string;
  value: string;
  timestamp: number;
}

export class MemoryManager {
  private memoryPath: string;
  private memory: Record<string, MemoryEntry> = {};

  constructor() {
    this.memoryPath = path.join(os.homedir(), '.spawner', 'memory.json');
    this.loadMemory();
  }

  private loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const content = fs.readFileSync(this.memoryPath, 'utf-8');
        this.memory = JSON.parse(content);
      }
    } catch (e) {
      console.error("Failed to load memory:", e);
      this.memory = {};
    }
  }

  private saveMemory() {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (e) {
      console.error("Failed to save memory:", e);
    }
  }

  set(key: string, value: string) {
    this.memory[key] = {
      key,
      value,
      timestamp: Date.now()
    };
    this.saveMemory();
    return this.memory[key];
  }

  get(key: string) {
    return this.memory[key];
  }

  list() {
    return Object.values(this.memory).sort((a, b) => b.timestamp - a.timestamp);
  }
}
