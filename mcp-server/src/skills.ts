import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  path: string;
  identity?: any;
  patterns?: any[];
  anti_patterns?: any[];
}

export class SkillManager {
  private rootDir: string;
  private skills: Skill[] = [];

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
  }

  async loadSkills() {
    // Find all skill.yaml files
    // We want to avoid searching inside node_modules or .git or mcp-server
    const files = await glob('**/*/skill.yaml', { 
        cwd: this.rootDir, 
        ignore: ['**/node_modules/**', '**/.git/**', '**/mcp-server/**'] 
    });

    this.skills = [];

    for (const file of files) {
      const fullPath = path.join(this.rootDir, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = yaml.load(content) as any;
        
        if (!data) continue;

        // Derive category and id from path
        // file path e.g.: maker/micro-saas-launcher/skill.yaml
        // parts: ['maker', 'micro-saas-launcher', 'skill.yaml']
        const parts = file.split(path.sep);
        let category = 'unknown';
        
        // If path is absolute or relative, normalize finding category
        // Assuming structure <category>/<skill>/skill.yaml
        if (parts.length >= 3) {
            category = parts[parts.length - 3];
        }

        const id = data.id || (parts.length >= 2 ? parts[parts.length - 2] : 'unknown');

        this.skills.push({
            id: id,
            name: data.name || id,
            category,
            description: data.description || (data.identity ? data.identity.role : ''), 
            path: fullPath,
            identity: data.identity,
            patterns: data.patterns,
            anti_patterns: data.anti_patterns
        });
      } catch (e) {
        console.error(`Error loading skill from ${file}:`, e);
      }
    }
  }

  async listSkills(category?: string): Promise<Partial<Skill>[]> {
    if (this.skills.length === 0) {
        await this.loadSkills();
    }

    let filtered = this.skills;
    if (category) {
        filtered = this.skills.filter(s => s.category === category);
    }

    // Return lightweight metadata only
    return filtered.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description ? s.description.substring(0, 200) + (s.description.length > 200 ? '...' : '') : ''
    }));
  }

  async searchSkills(query: string, category?: string): Promise<Partial<Skill>[]> {
    if (this.skills.length === 0) {
        await this.loadSkills();
    }

    const lowerQuery = query.toLowerCase();
    
    const results = this.skills.filter(skill => {
        if (category && skill.category !== category) return false;
        
        return (
            skill.name.toLowerCase().includes(lowerQuery) ||
            skill.id.toLowerCase().includes(lowerQuery) ||
            (skill.description && skill.description.toLowerCase().includes(lowerQuery))
        );
    });

    // Return metadata only for search as well
    return results.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description ? s.description.substring(0, 200) + (s.description.length > 200 ? '...' : '') : ''
    }));
  }
  
  async getSkillById(id: string): Promise<Skill | undefined> {
      if (this.skills.length === 0) {
          await this.loadSkills();
      }
      return this.skills.find(s => s.id === id);
  }

  getAllSkills(): Skill[] {
      return this.skills;
  }
}
