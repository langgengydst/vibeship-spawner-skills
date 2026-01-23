import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { logger } from './logger.js';

export interface ValidationRule {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'regex' | 'conceptual';
  pattern?: string;
  file_patterns?: string[];
  message: string;
  fix_action?: string;
  indicators?: string[];
  check?: string;
}

export interface ValidationResult {
  rule_id: string;
  name: string;
  severity: string;
  message: string;
  fix_action?: string;
}

export class ValidationManager {
  private rootDir: string;
  private rules: ValidationRule[] = [];

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir);
  }

  async loadRules() {
    const files = await glob('**/*/validations.yaml', { 
        cwd: this.rootDir, 
        ignore: ['**/node_modules/**', '**/.git/**', '**/mcp-server/**'] 
    });

    this.rules = [];

    for (const file of files) {
      const fullPath = path.join(this.rootDir, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = yaml.load(content) as any;
        
        if (data && data.validations && Array.isArray(data.validations)) {
            this.rules.push(...data.validations);
        }
      } catch (e) {
        logger.error({ error: e }, `Error loading validations from ${file}`);
      }
    }
    
    logger.info(`Loaded ${this.rules.length} validation rules`);
  }

  async validate(code: string, language?: string, context?: string): Promise<ValidationResult[]> {
      if (this.rules.length === 0) {
          await this.loadRules();
      }

      const results: ValidationResult[] = [];

      for (const rule of this.rules) {
          if (rule.type === 'regex' && rule.pattern) {
              try {
                  const re = new RegExp(rule.pattern);
                  if (re.test(code)) {
                      results.push({
                          rule_id: rule.id,
                          name: rule.name,
                          severity: rule.severity,
                          message: rule.message,
                          fix_action: rule.fix_action
                      });
                  }
              } catch (e) {
                  logger.error({ error: e }, `Invalid regex for rule ${rule.id}: ${rule.pattern}`);
              }
          }
      }
      return results;
  }
}
