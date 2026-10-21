"""Embed the built React/Babylon.js application and fonts for offline file review."""
from pathlib import Path
import re
import base64
import subprocess

root = Path(__file__).resolve().parents[1]
dist = root / 'dist-standalone'
css = (dist / 'style.css').read_text()
for font in (dist / 'fonts').glob('*.ttf'):
    encoded = 'data:font/ttf;base64,' + base64.b64encode(font.read_bytes()).decode()
    css = css.replace('./fonts/' + font.name, encoded).replace('/fonts/' + font.name, encoded)
# A classic IIFE avoids module startup restrictions in local-file viewers.
script = subprocess.run([
    'node', '--input-type=module', '-e',
    "import {transformSync} from 'esbuild'; import {readFileSync} from 'node:fs'; "
    "process.stdout.write(transformSync(readFileSync('dist-standalone/app.js','utf8'), "
    "{format:'iife',target:'es2020',define:{'import.meta.url':'document.baseURI'}}).code);"
], cwd=root, check=True, capture_output=True, text=True).stdout
script = re.sub(r'</script', r'<\\/script', script, flags=re.IGNORECASE)
assert '<img' not in (root / 'src/app/App.tsx').read_text()
assert '/fonts/' not in css
assert '.data:font' not in css
html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#FFF9ED"><title>Tenda · Street explorer</title><style>'
notices = '\n\n'.join(file.name + '\n' + file.read_text() for file in sorted((root / 'public/licenses').glob('*.txt')))
html += css + '</style></head><body><div id="startup" style="position:fixed;inset:0;display:grid;place-content:center;background:#fff9ed;color:#253e45;font:18px system-ui;padding:24px;z-index:9999">Opening your adventure…</div><div id="root"></div><script>window.addEventListener("error",function(e){var n=document.getElementById("startup");n.style.display="grid";n.textContent="Could not open the adventure: "+e.message;});new MutationObserver(function(){if(document.querySelector("canvas"))document.getElementById("startup").style.display="none";}).observe(document.getElementById("root"),{childList:true,subtree:true});</script><script>' + script + '</script><!-- Third-party notices\n' + notices.replace('-->', '-- >') + '\n--></body></html>'
output = root.parent / 'Tenda-Explorer-r26.html'
output.write_text(html)
print(f'{output.name}: {output.stat().st_size:,} bytes, offline React + Babylon.js build.')

