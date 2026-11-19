import fs from 'fs';
import path from 'path';
import { THEME_STORAGE_KEY } from '../theme/ThemeProvider';

const SRC = path.resolve(__dirname, '..');
const TOKENS_FILE = path.join(SRC, 'styles', 'tokens.css');

const listFiles = (dir, extension) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(fullPath, extension);
    return entry.name.endsWith(extension) ? [fullPath] : [];
  });

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const NAMED_COLOURS = ['black', 'white', 'red', 'grey', 'gray', 'blue', 'green', 'yellow', 'orange', 'silver'];
const COLOUR_LITERAL = new RegExp(
  `#[0-9a-f]{3,8}\\b|\\b(?:rgba?|hsla?)\\(|:\\s*(?:${NAMED_COLOURS.join('|')})\\b|[\\s,(](?:${NAMED_COLOURS.join('|')})\\s*[;),]`,
  'i'
);
const LEGACY_FONTS = /Atami|Etna|Conflate|Times New Roman|Franklin Gothic|font-family:\s*Arial/i;

describe('stylesheets', () => {
  const stylesheets = listFiles(SRC, '.css').filter((file) => file !== TOKENS_FILE);

  test.each(stylesheets.map((file) => [path.relative(SRC, file), file]))(
    '%s uses colour tokens instead of literals',
    (_, file) => {
      const offending = stripComments(fs.readFileSync(file, 'utf8'))
        .split('\n')
        .map((line, index) => ({ line: line.trim(), number: index + 1 }))
        .filter(({ line }) => COLOUR_LITERAL.test(line));
      expect(offending).toEqual([]);
    }
  );

  test.each(stylesheets.map((file) => [path.relative(SRC, file), file]))(
    '%s uses the font tokens',
    (_, file) => {
      expect(stripComments(fs.readFileSync(file, 'utf8'))).not.toMatch(LEGACY_FONTS);
    }
  );
});

const readThemeTokens = () => {
  const css = stripComments(fs.readFileSync(TOKENS_FILE, 'utf8'));
  const block = (selector) => {
    const start = css.indexOf(`${selector} {`);
    if (start === -1) throw new Error(`Missing theme block ${selector}`);
    const body = css.slice(start, css.indexOf('}', start));
    return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
  };
  return { light: block("[data-theme='light']"), dark: block("[data-theme='dark']") };
};

const luminance = (hex) => {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

const contrast = (a, b) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
};

describe('theme tokens', () => {
  const themes = readThemeTokens();
  const PAIRS = [
    ['--color-text', '--color-bg'],
    ['--color-text', '--color-surface'],
    ['--color-text', '--color-surface-muted'],
    ['--color-text-muted', '--color-bg'],
    ['--color-text-muted', '--color-surface'],
    ['--color-accent-text', '--color-bg'],
    ['--color-accent-text', '--color-surface'],
    ['--color-on-accent', '--color-accent'],
    ['--color-danger', '--color-surface'],
    ['--color-success', '--color-surface'],
  ];

  test.each(['light', 'dark'])('%s theme defines the requested palette', (theme) => {
    const expected = {
      light: { bg: '#f7f7f5', 'bg-secondary': '#ffffff', surface: '#ffffff', accent: '#e6b800', text: '#171717', 'text-muted': '#626262' },
      dark: { bg: '#101114', 'bg-secondary': '#181a20', surface: '#202329', accent: '#f4c900', text: '#ffffff', 'text-muted': '#b7bac3' },
    }[theme];
    Object.entries(expected).forEach(([name, value]) => expect(themes[theme][`--color-${name}`]).toBe(value));
  });

  describe.each(['light', 'dark'])('%s theme', (theme) => {
    test.each(PAIRS)('%s on %s meets WCAG AA (4.5:1)', (foreground, background) => {
      expect(contrast(themes[theme][foreground], themes[theme][background])).toBeGreaterThanOrEqual(4.5);
    });
  });

  test('the pre-paint script in index.html matches the theme provider and token backgrounds', () => {
    const html = fs.readFileSync(path.resolve(SRC, '..', 'public', 'index.html'), 'utf8');
    expect(html).toContain(THEME_STORAGE_KEY);
    expect(html).toContain('(prefers-color-scheme: light)');
    expect(html.toLowerCase()).toContain(themes.light['--color-bg']);
    expect(html.toLowerCase()).toContain(themes.dark['--color-bg']);
  });
});
