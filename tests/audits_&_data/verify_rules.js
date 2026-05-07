const fs = require('fs');
const path = require('path');

function verify() {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const testSheetPath = path.resolve(__dirname, '../test-sheet.js');
    const testSheetContent = fs.existsSync(testSheetPath)
        ? fs.readFileSync(testSheetPath, 'utf8')
        : '';

    console.log("--- Rule Consistency Check ---");

    // 1. Verify Classes
    console.log("Checking Classes consistency...");
    const classSectionMatch = htmlContent.match(/<section id="classes"[\s\S]*?<\/section>/);
    const classesInCards = [];
    if (classSectionMatch) {
        const cardMatches = classSectionMatch[0].matchAll(/<h3 class="class-title">(.*?)<\/h3>/g);
        for (const match of cardMatches) {
            classesInCards.push(match[1].toLowerCase());
        }
    }
    console.log(`  Found ${classesInCards.length} classes in UI cards: ${classesInCards.join(', ')}`);

    // Extract classes from the dynamic showClassSelection list
    const classArraySource = `${htmlContent}\n${testSheetContent}`;
    const classArrayMatch = classArraySource.match(/const classes = \[([\s\S]*?)\];/);
    const classesInOptions = [];
    if (classArrayMatch) {
        const nameMatches = classArrayMatch[1].matchAll(/name:\s*"(.*?)"/g);
        for (const match of nameMatches) {
            classesInOptions.push(match[1].toLowerCase());
        }
    }
    console.log(`  Found ${classesInOptions.length} classes in Character Creator: ${classesInOptions.join(', ')}`);

    // Cross-check
    const missingInOptions = classesInCards.filter(c => !classesInOptions.includes(c));
    if (missingInOptions.length > 0) {
        console.error(`  [FAIL] Classes in UI but missing in Character Creator: ${missingInOptions.join(', ')}`);
    } else if (classesInOptions.length < 10) {
        console.error(`  [FAIL] Found only ${classesInOptions.length} classes in Creator. Expected 10.`);
    } else {
        console.log("  [OK] All primary classes are present in both UI and Character Creator (10 count confirmed).");
    }


    // 2. Verify Themes
    console.log("Checking Themes consistency...");
    const themeSelectMatch = htmlContent.match(/<select id="theme-select"[\s\S]*?<\/select>/);
    const themesInSelect = [];
    if (themeSelectMatch) {
        const optionMatches = themeSelectMatch[0].matchAll(/value="(.*?)"/g);
        for (const match of optionMatches) {
            themesInSelect.push(match[1]);
        }
    }
    console.log(`  Found ${themesInSelect.length} themes in header.`);

    const cssPath = path.resolve(__dirname, '../styles.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const themesInCSS = [];
    const cssThemeMatches = cssContent.matchAll(/\[data-theme=['"](.*?)['"]\]/g);
    for (const match of cssThemeMatches) {
        if (!themesInCSS.includes(match[1])) {
            themesInCSS.push(match[1]);
        }
    }
    console.log(`  Found ${themesInCSS.length} theme definitions in CSS.`);

    const missingInCSS = themesInSelect.filter(t => !themesInCSS.includes(t));
    if (missingInCSS.length > 0) {
        console.error(`  [FAIL] Themes in select but missing in CSS: ${missingInCSS.join(', ')}`);
    } else {
        console.log("  [OK] All themes in header have CSS definitions.");
    }

    console.log("------------------------------");
}

if (require.main === module) {
    verify();
}
