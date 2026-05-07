
import fs from 'fs';

const html = fs.readFileSync('zprime/index.html', 'utf8');
const stack = [];
const tagRegex = /<\/?([a-zA-Z0-9-]+)(\s+[^>]*)?>/g;
let match;

while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || ['img', 'br', 'hr', 'input', 'link', 'meta'].includes(tagName);

    if (isSelfClosing) continue;

    if (isClosing) {
        if (stack.length === 0) {
            console.log(`Unexpected closing tag </${tagName}> at index ${match.index}`);
        } else {
            const last = stack.pop();
            if (last.name !== tagName) {
                console.log(`Mismatched closing tag </${tagName}> at index ${match.index}. Expected </${last.name}> (opened at ${last.index})`);
            }
        }
    } else {
        stack.push({ name: tagName, index: match.index });
    }
}

if (stack.length > 0) {
    console.log("Unclosed tags:");
    stack.forEach(tag => console.log(`Tag <${tag.name}> at index ${tag.index} is not closed.`));
} else {
    console.log("All tags closed correctly.");
}
