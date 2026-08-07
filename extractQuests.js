const fs = require('fs');
const content = fs.readFileSync('lib/questData.ts', 'utf8');

// Extract QUESTS array
const start = content.indexOf('export const QUESTS');
const bracketStart = content.indexOf('[', start);
let depth = 0;
let end = -1;
for (let i = bracketStart; i < content.length; i++) {
  if (content[i] === '[') depth++;
  else if (content[i] === ']') {
    depth--;
    if (depth === 0) { end = i; break; }
  }
}

const arrStr = content.substring(bracketStart + 1, end);
const quests = [];

// Simple parser for quest objects
let current = {};
const lines = arrStr.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//')) continue;
  
  if (trimmed.startsWith('{')) {
    current = {};
  } else if (trimmed.startsWith('},')) {
    if (Object.keys(current).length > 0) {
      quests.push(current);
    }
    current = {};
  } else {
    const keyMatch = trimmed.match(/(\w+):\s*"([^"]*)"/);
    if (keyMatch) {
      current[keyMatch[1]] = keyMatch[2];
    }
    const numMatch = trimmed.match(/(\w+):\s*(\d+)/);
    if (numMatch) {
      current[numMatch[1]] = parseInt(numMatch[2]);
    }
    const boolMatch = trimmed.match(/(\w+):\s*(true|false)/);
    if (boolMatch) {
      current[boolMatch[1]] = boolMatch[1] === 'true';
    }
  }
}

fs.writeFileSync('public/data/quests.json', JSON.stringify(quests, null, 2), 'utf8');
console.log('Exported', quests.length, 'quests');