import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';
import styleVariables from './src/styleVariables';

const isAnalyze = process.argv.includes('analyze');

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    legacy({ targets: ['defaults', 'not ie <= 11', 'not op_mini all'] }),
    isAnalyze &&
      visualizer({ open: true, filename: 'build/stats.html', gzipSize: true }),
  ],

  resolve: {
    alias: {
      'moment-timezone': 'moment-timezone/builds/moment-timezone-with-data',
    },
  },

  css: {
    preprocessorOptions: {
      less: {
        modifyVars: styleVariables,
        javascriptEnabled: true,
      },
    },
  },

  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://hep-web:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'build',
    sourcemap: true,
    // TODO: try to get rid off this part once the packages are more up to date
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/antd/') || id.includes('/@ant-design/'))
            return 'vendor-antd';
          if (id.includes('/recharts/') || id.includes('/d3-'))
            return 'vendor-charts';
          return undefined;
        },
      },
    },
  },
});
