/**
 * Renders every page and shell component to a string with a minimal DOM shim.
 *
 * This catches the failures a bundler cannot see: bad props, undefined
 * imports, hooks used outside a provider, or a component that throws on first
 * paint in a fresh session. Run it with `npm run check` (or as part of CI).
 */
import { build } from 'esbuild';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  ['Home', 'pages/Home.jsx', '/'],
  ['Browse', 'pages/Browse.jsx', '/browse'],
  ['ItemDetail', 'pages/ItemDetail.jsx', '/items/demo-item'],
  ['ListItem', 'pages/ListItem.jsx', '/list-item'],
  ['Dashboard', 'pages/Dashboard.jsx', '/dashboard'],
  ['MyItems', 'pages/MyItems.jsx', '/my-items'],
  ['Requests', 'pages/Requests.jsx', '/requests'],
  ['Wishlist', 'pages/Wishlist.jsx', '/wishlist'],
  ['Messages', 'pages/Messages.jsx', '/messages'],
  ['Profile', 'pages/Profile.jsx', '/profile'],
  ['Login', 'pages/Login.jsx', '/login'],
  ['Register', 'pages/Register.jsx', '/register'],
  ['InfoPage', 'pages/InfoPage.jsx', '/terms'],
];

const COMPONENTS = [
  ['Navbar', 'components/Navbar.jsx', '/'],
  ['Footer', 'components/Footer.jsx', '/'],
];

const entry = `
import '${root}/node_modules/.cache/borrowbox-render/shims.mjs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '${root}/src/context/AuthContext.jsx';
import { ThemeProvider } from '${root}/src/context/ThemeContext.jsx';
import ErrorBoundary from '${root}/src/components/ErrorBoundary.jsx';
import ItemCard from '${root}/src/components/ItemCard.jsx';

${PAGES.concat(COMPONENTS).map(([name, file]) => `import ${name} from '${root}/src/${file}';`).join('\n')}

const SAMPLE_ITEM = {
  id: 'demo-item',
  title: 'DeWalt 20V Cordless Drill Kit',
  description: 'Professional grade cordless drill with two batteries and a carry case.',
  category: 'Tools',
  categoryDetails: { id: 'c1', slug: 'tools', name: 'Tools', icon: 'wrench' },
  condition: 'Like New',
  value: 199,
  lendingFee: 0,
  availability: 'available',
  location: 'Mission District, SF - 0.2 miles',
  tags: ['power-tools', 'diy'],
  images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=900&q=80'],
  ownerId: 'u2',
  owner: { id: 'u2', name: 'User 2', avatar: '', rating: 4.9, verified: true, totalLends: 24, location: 'Mission District, SF' },
  rating: 4.9,
  reviewCount: 2,
  borrowCount: 8,
  featured: true,
  createdAt: new Date().toISOString(),
  reviews: [],
  relatedItems: [],
};

const cases = [
${PAGES.map(([name, , route]) => `  ['${name}', ${name}, '${route}'],`).join('\n')}
${COMPONENTS.map(([name, , route]) => `  ['${name}', ${name}, '${route}'],`).join('\n')}
  ['ItemCard', () => React.createElement(ItemCard, { item: SAMPLE_ITEM, index: 0 }), '/'],
];

// framer-motion warns about useLayoutEffect during server rendering, which is
// expected in this harness and hides more useful output.
const originalError = console.error;
console.error = (...args) => {
  if (String(args[0]).includes('useLayoutEffect does nothing on the server')) return;
  originalError(...args);
};

const results = [];
for (const [name, Component, route] of cases) {
  try {
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: [route] },
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(
            AuthProvider,
            null,
            React.createElement(ErrorBoundary, null, React.createElement(Component)),
          ),
        ),
      ),
    );
    if (!html || html.length < 40) throw new Error('render produced almost no markup');
    results.push([name, 'ok', html.length]);
  } catch (error) {
    results.push([name, 'FAIL', error.message]);
  }
}

for (const [name, status, detail] of results) {
  console.log(\`\${status === 'ok' ? '  ok  ' : '  FAIL'} \${name.padEnd(11)} \${detail}\`);
}

const failures = results.filter(([, status]) => status !== 'ok');
console.log(\`\\n\${results.length - failures.length}/\${results.length} components rendered\`);
if (failures.length) process.exitCode = 1;
`;

const shims = `
const store = new Map();
const localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};
const matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
});
const element = () => ({
  style: {},
  dataset: {},
  children: [],
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  setAttribute() {},
  getAttribute: () => null,
  removeAttribute() {},
  appendChild() {},
  removeChild() {},
  insertBefore() {},
  addEventListener() {},
  removeEventListener() {},
  getBoundingClientRect: () => ({ top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }),
  innerHTML: '',
  textContent: '',
  parentNode: null,
});

globalThis.localStorage = localStorage;
globalThis.window = {
  localStorage,
  matchMedia,
  location: { pathname: '/', href: 'http://localhost/', origin: 'http://localhost', assign() {} },
  addEventListener() {},
  removeEventListener() {},
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  requestAnimationFrame: (callback) => setTimeout(callback, 0),
  cancelAnimationFrame() {},
  scrollTo() {},
  scrollY: 0,
  innerWidth: 1280,
  innerHeight: 900,
};
globalThis.document = {
  documentElement: element(),
  head: element(),
  body: element(),
  createElement: () => element(),
  createTextNode: () => ({}),
  getElementsByTagName: () => [element()],
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
};
globalThis.SVGElement = class SVGElement {};
globalThis.HTMLElement = class HTMLElement {};
globalThis.Element = class Element {};
globalThis.Node = class Node {};
globalThis.requestAnimationFrame = globalThis.window.requestAnimationFrame;
`;

// Keep the generated entry inside the project so module resolution and
// relative imports behave exactly as they do for the application.
const workDir = path.join(root, 'node_modules/.cache/borrowbox-render');
fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(workDir, { recursive: true });
fs.writeFileSync(path.join(workDir, 'entry.jsx'), entry);
fs.writeFileSync(path.join(workDir, 'shims.mjs'), shims);

const outFile = path.join(workDir, 'bundle.mjs');

await build({
  entryPoints: [path.join(workDir, 'entry.jsx')],
  outfile: outFile,
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  logLevel: 'error',
  absWorkingDir: root,
  define: { 'import.meta.env': JSON.stringify({ VITE_API_URL: '/api' }) },
  banner: {
    js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);",
  },
});

await import(pathToFileURL(outFile).href);
