"""Export one source ZIP for Vercel; generated builds stay out of source control."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
excluded = {'node_modules', 'dist', 'dist-browser', 'dist-standalone', '.git', '.vercel', 'coverage', '__pycache__', '.cache', '.vite'}
source = root.parent / 'Tenda-Explorer-r26-source.zip'
with ZipFile(source, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(root.rglob('*')):
        if not any(part in excluded for part in path.relative_to(root).parts) and path.is_file():
            if path.name.startswith('.env') and not path.name.endswith('.example'):
                continue
            archive.write(path, Path(root.name) / path.relative_to(root))
with ZipFile(source) as archive:
    if archive.testzip() is not None:
        raise SystemExit(f'Archive verification failed: {source.name}')
    if f'{root.name}/.gitignore' not in archive.namelist():
        raise SystemExit('Source must include .gitignore')
print(f'{source.name}: {source.stat().st_size:,} bytes, verified')
