#!/data/data/com.termux/files/usr/bin/bash
set -e
git add -A
git commit -m "fix(build): resolve entry point in index.html and clean vite.config.ts"
git push origin main
echo "=== Successfully pushed to GitHub! Vercel build triggered. ==="
