const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else results.push(file);
  });
  return results;
}

const files = walk('src/app/api').filter(f => f.endsWith('route.ts') && !f.includes('webhooks'));

// Regex to detect the broken double-return pattern our previous script produced
const brokenPattern = /const\s+\{\s*userId\s*\}\s*=\s*await\s+auth\(\);\s*\n\s*if\s+\(!userId\)\s+return\s+NextResponse\.json\(\{[^}]+\},\s*\{\s*status:\s*401\s*\}\);,\s*\{\s*status:\s*401\s*\}\);\s*\n\s*\}/g;

const fixedPattern = `const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`;

let fixed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (brokenPattern.test(content)) {
    brokenPattern.lastIndex = 0;
    content = content.replace(brokenPattern, fixedPattern);
    fs.writeFileSync(f, content);
    console.log('Fixed syntax: ' + f);
    fixed++;
  }
});

console.log(`\nFixed ${fixed} files.`);
