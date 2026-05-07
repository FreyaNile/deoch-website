import fs from 'fs';

const html = fs.readFileSync('zprime/index.html', 'utf8');
const indices = [141867, 144053, 153572, 176828, 180374, 196307];

indices.forEach(idx => {
    const start = Math.max(0, idx - 150);
    const end = Math.min(html.length, idx + 150);
    console.log(`\n--- Context for ${idx} ---`);
    console.log(html.substring(start, end));
});
