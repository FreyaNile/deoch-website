import fs from 'fs';

const html = fs.readFileSync('zprime/index.html', 'utf8');
const hudStart = html.indexOf('<div id="top-mobile-hud"');
const nextSection = html.indexOf('<!-- Character Data Transfer Modal -->');
const hudHtml = html.substring(hudStart, nextSection);

const stack = [];
const tagRegex = /<\/?([a-zA-Z0-9-]+)(\s+[^>]*)?>/g;
let match;
while ((match = tagRegex.exec(hudHtml)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelfClosing = fullTag.endsWith('/>') || ['img', 'br', 'hr', 'input', 'link', 'meta'].includes(tagName);
    if (isSelfClosing) continue;
    
    if (isClosing) {
        if (stack.length === 0) {
            console.log('Extra closing: ' + tagName + ' at ' + match.index);
        } else {
            const last = stack.pop();
            if (last !== tagName) {
                console.log('Mismatch: closing ' + tagName + ' but expected ' + last + ' at ' + match.index);
            }
        }
    } else {
        stack.push(tagName);
        console.log('Opened: ' + tagName);
    }
}
console.log('Left on stack at end of HUD section:', stack);