import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import express from 'express';
import cors from 'cors';
// @ts-expect-error - Express router in JS module
import apiRouter from './server/api.js';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      const app = express();
      app.use(cors());
      app.use(express.json({ limit: '30mb' }));
      app.use(express.urlencoded({ extended: true, limit: '30mb' }));
      app.use('/api', apiRouter);

      server.middlewares.use(app);
    },
    configurePreviewServer(server) {
      const app = express();
      app.use(cors());
      app.use(express.json({ limit: '30mb' }));
      app.use(express.urlencoded({ extended: true, limit: '30mb' }));
      app.use('/api', apiRouter);

      server.middlewares.use(app);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiServerPlugin()],
});

