import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { logger } from './logger.js';

export interface SharpEdge {
  id: string;
  summary: string;
  severity: string;
  situation: string;
  why: string;
  solution: string;
  detection_pattern?: string;
  skill_id?: string;
}

export class SharpEdgeManager {
  private rootDir: string;
  private edges: SharpEdge[] = [];

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
  }

  async loadEdges() {
    const files = await glob('**/*/sharp-edges.yaml', { 
        cwd: this.rootDir, 
        ignore: ['**/node_modules/**', '**/.git/**', '**/mcp-server/**'] 
    });

    this.edges = [];

    for (const file of files) {
      const fullPath = path.join(this.rootDir, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = yaml.load(content) as any;
        
        // Derive skill id from path
        const parts = file.split(path.sep);
        let skillId = 'unknown';
        if (parts.length >= 2) {
             skillId = parts[parts.length - 2];
        }

        if (data && data.sharp_edges && Array.isArray(data.sharp_edges)) {
            const edges = data.sharp_edges.map((e: any) => ({ ...e, skill_id: skillId }));
            this.edges.push(...edges);
        }
      } catch (e) {
        logger.error({ error: e }, `Error loading sharp edges from ${file}`);
      }
    }
    
    logger.info(`Loaded ${this.edges.length} sharp edges`);
  }

  async check(code?: string, skillId?: string): Promise<SharpEdge[]> {
      if (this.edges.length === 0) {
          await this.loadEdges();
      }

      let results: SharpEdge[] = [];
      
      if (skillId) {
          results = this.edges.filter(e => e.skill_id === skillId);
      } else {
          // If no skillId, we might not want to return all edges unless code is provided
          // If code provided, we filter by matches.
          results = this.edges;
      }

      if (code) {
          results = results.filter(edge => {
              if (edge.detection_pattern) {
                  try {
                      const re = new RegExp(edge.detection_pattern, 'i');
                      return re.test(code);
              } catch (e) {
                  logger.error({ error: e }, `Invalid regex for edge ${edge.id}: ${edge.detection_pattern}`);
              }
              }
              return false;
          });
      }

      return results;
  }
}
