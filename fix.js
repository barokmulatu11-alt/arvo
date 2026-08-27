const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/dashboard/layout.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/editor/[id]/page.tsx'
];

const replacements = [
  { regex: /\bbg-white\b/g, replace: 'bg-background' },
  { regex: /\bborder-neutral-100\b/g, replace: 'border-border' },
  { regex: /\bborder-neutral-150\b/g, replace: 'border-border' },
  { regex: /\bborder-neutral-200\b/g, replace: 'border-border' },
  { regex: /\btext-neutral-900\b/g, replace: 'text-foreground' },
  { regex: /\btext-neutral-800\b/g, replace: 'text-foreground' },
  { regex: /\btext-neutral-700\b/g, replace: 'text-foreground' },
  { regex: /\btext-neutral-600\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-neutral-500\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-neutral-400\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-neutral-450\b/g, replace: 'text-muted-foreground' },
  { regex: /\bh-screen bg-background\b/g, replace: 'h-screen bg-background' },
  { regex: /\bbg-neutral-50\/50\b/g, replace: 'bg-surface' },
  { regex: /\bbg-neutral-50\/20\b/g, replace: 'bg-surface' },
  { regex: /\bbg-neutral-50\b/g, replace: 'bg-surface' },
  { regex: /\bhover:bg-neutral-50\b/g, replace: 'hover:bg-surface' },
  { regex: /\bhover:bg-neutral-100\b/g, replace: 'hover:bg-surface' },
  { regex: /\bbg-neutral-100\b/g, replace: 'bg-surface' },
  { regex: /\bbg-neutral-150\b/g, replace: 'bg-surface' }
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Some specific structural fixes
    // In dashboard/layout.tsx, main render panel should be bg-background, sidebar bg-surface
    if (file.includes('layout.tsx')) {
      content = content.replace(/bg-background flex flex-col/g, 'bg-background flex flex-col');
      content = content.replace(/w-56 border-r border-border flex-col justify-between shrink-0 bg-background/g, 'w-56 border-r border-border flex-col justify-between shrink-0 bg-surface');
      content = content.replace(/md:hidden h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/g, 'md:hidden h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-surface');
    }

    replacements.forEach(({ regex, replace }) => {
      content = content.replace(regex, replace);
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
