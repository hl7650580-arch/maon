import { writeFileSync } from 'fs';

// SVG icon as base
function svgIcon(size) {
  const r = Math.round(size * 0.18);
  const fs = Math.round(size * 0.6);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1e3a5f"/>
  <text x="50%" y="54%" font-size="${fs}" text-anchor="middle" dominant-baseline="middle">🏠</text>
</svg>`;
}

writeFileSync('public/icon-192.svg', svgIcon(192));
writeFileSync('public/icon-512.svg', svgIcon(512));
console.log('SVG icons created. Use a converter to make PNGs or reference the SVGs directly.');
