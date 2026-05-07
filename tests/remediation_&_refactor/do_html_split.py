import os
import re

zprime_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'zprime')
index_path = os.path.join(zprime_dir, 'index.html')

with open(index_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find key lines
head_to_main_end = 0
for i, line in enumerate(lines):
    if '<main class="content-wrapper">' in line:
        head_to_main_end = i + 1
        break

updates_end = 0
for i, line in enumerate(lines):
    if '<!-- Shared Splash Screen Overlay -->' in line:
        updates_end = i
        break
        
main_close = 0
footer_start = 0
footer_end = 0
for i, line in enumerate(lines):
    if '</main>' in line:
        main_close = i
    if '<!-- Footer -->' in line:
        footer_start = i
    if '</footer>' in line:
        footer_end = i + 1

# Extract sections
head_nav_main = lines[:head_to_main_end]
site_content = lines[head_to_main_end:updates_end]
sheet_content = lines[updates_end:main_close]
footer = lines[footer_start:footer_end]
sheet_modals_and_scripts = lines[footer_end:]

# Create index.html (Site)
site_html = head_nav_main + site_content + ["    </main>\n\n"] + footer + [
    "\n    <!-- Site Entry Point -->\n",
    '    <script defer src="https://unpkg.com/lucide@latest"></script>\n',
    '    <script type="module" src="site-app.js"></script>\n',
    "</body>\n</html>\n"
]

# Create sheet.html (Character)
sheet_html = head_nav_main + sheet_content + ["    </main>\n\n"] + sheet_modals_and_scripts

# Fix navigation links in site_html
for i, line in enumerate(site_html):
    if 'data-target="test-page"' in line and 'nav-btn' in line:
        site_html[i] = line.replace('href="#test-page"', 'href="sheet.html"').replace('data-target="test-page"', '')
    if 'data-nav="test-page"' in line and '<button' in line:
        site_html[i] = line.replace('data-nav="test-page"', 'onclick="window.location.href=\'sheet.html\'"')

# Fix navigation links in sheet_html
for i, line in enumerate(sheet_html):
    if 'data-target="home"' in line:
        sheet_html[i] = line.replace('href="#home"', 'href="index.html#home"')
    if 'data-target="why-deoch"' in line:
        sheet_html[i] = line.replace('href="#why-deoch"', 'href="index.html#why-deoch"')
    if 'data-target="classes"' in line:
        sheet_html[i] = line.replace('href="#classes"', 'href="index.html#classes"')
    if 'data-target="updates"' in line:
        sheet_html[i] = line.replace('href="#updates"', 'href="index.html#updates"')
    if 'data-target="test-page"' in line and 'nav-btn' in line:
        sheet_html[i] = line.replace('href="#test-page"', 'href="#"')

with open(index_path, 'w', encoding='utf-8') as f:
    f.writelines(site_html)

with open(os.path.join(zprime_dir, 'sheet.html'), 'w', encoding='utf-8') as f:
    f.writelines(sheet_html)

# Create site-app.js
site_app_js = """/**
 * Deoch TTRPG - Site Entry Point
 * Minimal JS for landing pages.
 */
class SiteApp {
    init() {
        console.log('Deoch Site: Initializing...');
        
        // Theme switcher
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = localStorage.getItem('deoch-theme-preference') || 'sandstorm';
            themeSelect.addEventListener('change', (e) => {
                if (window.applyTheme) window.applyTheme(e.target.value);
            });
        }
        
        // Navigation binds
        document.querySelectorAll('.nav-btn[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    target.classList.add('active');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    history.pushState(null, null, this.getAttribute('href'));
                }
            });
        });
        
        // Handle direct links on load
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
                target.classList.add('active');
                const btn = document.querySelector(`.nav-btn[href="${window.location.hash}"]`);
                if (btn) btn.classList.add('active');
            }
        }
        
        // Footer toggles
        document.getElementById('privacy-toggle-btn')?.addEventListener('click', () => {
            const c = document.getElementById('privacy-content');
            if(c) c.classList.toggle('active');
        });
        document.getElementById('contact-toggle-btn')?.addEventListener('click', () => {
            const c = document.getElementById('contact-content');
            if(c) c.classList.toggle('active');
        });
        
        // Scroll to top
        document.querySelectorAll('[data-action="scroll-top"]').forEach(btn => {
            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Initialize Lucide icons if available
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new SiteApp().init());
"""

with open(os.path.join(zprime_dir, 'site-app.js'), 'w', encoding='utf-8') as f:
    f.write(site_app_js)

print("Split completed.")
