import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, 'src');
const outDir = path.resolve(__dirname, 'docs');

const pages = {
  main: {
    file: 'index.html',
    chunks: ['/javascripts/index.js', '/javascripts/allStyles.js']
  },

  about: {
    file: 'pages/about.html'
  },

  cases: {
    file: 'pages/cases.html'
  },

  dictionary: {
    file: 'pages/dictionary.html'
  },

  podcasts: {
    file: 'pages/podcasts.html'
  },

  vanishingUsers: {
    file: 'pages/cases/vanishing__users.html'
  },

  conversionParadox: {
    file: 'pages/cases/conversion__paradox.html'
  },

  dictionaryTest1: {
    file: 'pages/dictionary/test__1.html'
  },

  dictionaryTest2: {
    file: 'pages/dictionary/test__2.html'
  },

  podcast1: {
    file: 'pages/podcasts/podcast__1.html'
  },

  podcast2: {
    file: 'pages/podcasts/podcast__2.html'
  }
};

const chunksByFile = Object.fromEntries(
  Object.values(pages).map(({ file, chunks }) => [file, chunks])
);

function pageChunksPlugin() {
  return {
    name: 'page-chunks',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const relFile = path
          .relative(root, ctx.filename)
          .split(path.sep)
          .join('/');
        const chunks = chunksByFile[relFile];
        if (!chunks) return html;

        return {
          html,
          tags: chunks.map((src) => ({
            tag: 'script',
            attrs: { type: 'module', src },
            injectTo: 'body'
          }))
        };
      }
    }
  };
}

export default defineConfig(({ command, isPreview }) => ({
  root,
  base: command === 'build' || isPreview ? '/does-it-work/' : '/',
  plugins: [pageChunksPlugin()],
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, { file }]) => [
          name,
          path.resolve(root, file)
        ])
      )
    }
  },
  server: {
    open: true
  }
}));
