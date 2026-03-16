import { Jimp } from 'jimp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createIcon(size, outputPath) {
  const image = new Jimp({ width: size, height: size, color: 0x4F46E5FF });
  
  const margin = Math.floor(size * 0.15);
  const circleSize = size - (margin * 2);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const centerX = size / 2;
      const centerY = size / 2;
      const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (dist > circleSize / 2) {
        image.setPixelColor(0x00000000, x, y);
      } else {
        image.setPixelColor(0xFFFFFFFF, x, y);
      }
    }
  }
  
  await image.write(outputPath);
  console.log(`Created: ${outputPath}`);
}

async function main() {
  const iconsDir = path.join(__dirname, 'public', 'icons');
  
  await fs.mkdir(iconsDir, { recursive: true });
  
  await createIcon(192, path.join(iconsDir, 'icon-192.png'));
  await createIcon(512, path.join(iconsDir, 'icon-512.png'));
  
  console.log('Icons created successfully!');
}

main().catch(console.error);
