const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const sources = [
  'src/images/hero/animation.jpg',
  'src/images/hero/animation-480.jpg',
  'src/images/hero/vfx.jpg',
  'src/images/hero/vfx-480.jpg',
  'src/images/hero/game-design.jpg',
  'src/images/hero/game-design-480.jpg',
  'src/images/hero/multimedia.jpg',
  'src/images/hero/multimedia-480.jpg',
  'src/images/courses/ad3d.jpg',
  'src/images/courses/ad3d-960.jpg',
  'src/images/courses/advfx.jpg',
  'src/images/courses/advfx-960.jpg',
  'src/images/courses/adidgp.jpg',
  'src/images/courses/adidgp-960.jpg',
  'src/images/courses/apdmd.jpg',
  'src/images/courses/apdmd-960.jpg',
  'src/images/courses/short-term.jpg',
  'src/images/courses/short-term-960.jpg',
  'src/images/courses/more-career.jpg',
  'src/images/courses/more-career-960.jpg',
  'src/images/courses/catalogue.jpg',
  'src/images/courses/catalogue-960.jpg',
];

const convert = async (relative) => {
  const input = path.join(root, relative);
  const base = input.replace(/\.jpe?g$/, '');
  const image = sharp(input);
  await image.clone().webp({ quality: 62 }).toFile(`${base}.webp`);
  await image.clone().avif({ quality: 45 }).toFile(`${base}.avif`);
  const before = fs.statSync(input).size;
  let webp = fs.statSync(`${base}.webp`).size;
  let avif = fs.statSync(`${base}.avif`).size;
  if (webp >= before) {
    fs.unlinkSync(`${base}.webp`);
    webp = 0;
  }
  if (avif >= before) {
    fs.unlinkSync(`${base}.avif`);
    avif = 0;
  }
  console.log(`${relative}: jpeg ${before} webp ${webp || 'skipped'} avif ${avif || 'skipped'}`);
};

const ogImage = async () => {
  const logo = await sharp(path.join(root, 'src/images/maac.png'))
    .resize({ height: 220, fit: 'inside' })
    .png()
    .toBuffer();
  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: '#101114' },
  })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(path.join(root, 'public/og.png'));
  console.log('Wrote public/og.png');
};

(async () => {
  for (const file of sources) {
    // eslint-disable-next-line no-await-in-loop
    await convert(file);
  }
  await ogImage();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
