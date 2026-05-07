
import fs from 'fs';

const content = fs.readFileSync('Deoch/gamejs/app.js', 'utf8');
const lines = content.split('\n');
let stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        if (line[j] === '{') {
            stack.push({ line: i + 1, char: j + 1 });
        } else if (line[j] === '}') {
            if (stack.length > 0) {
                stack.pop();
            } else {
                console.log(`Extra closing brace at line ${i + 1}, char ${j + 1}`);
            }
        }
    }
}

if (stack.length > 0) {
    console.log("Unclosed braces:");
    stack.forEach(s => console.log(`Line ${s.line}`));
} else {
    console.log("All braces closed.");
}
