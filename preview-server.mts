/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PREVIEW_PORT;
const APP_NAME = process.env.APP_NAME;
const DOMAIN = process.env.DOMAIN;
const BACKEND_NAME = process.env.BACKEND_NAME;
const MCS_URL = process.env.MCS_URL;
const DIST_PATH = path.resolve(__dirname, 'dist');
const MCS_RECONNECT_DELAY = 10000;

const app = express();

app.use(express.static(DIST_PATH));

const connectToMCS = async (): Promise<void> => {
  try {
    const body = JSON.stringify({
      name: APP_NAME,
      url: `${DOMAIN}:${PORT}`,
      component: 'Content',
      backendName: BACKEND_NAME,
    });
    const response = await fetch(`${MCS_URL}/api/microfrontends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (response.ok) {
      console.log('Successfully connected to MCS');
    } else {
      console.log(`Failed connecting to MCS. Status: ${response.status}`);
      setTimeout(async () => connectToMCS(), MCS_RECONNECT_DELAY);
    }
  } catch (error) {
    console.log(`Failed connecting to MCS: ${error}`);
    setTimeout(async () => connectToMCS(), MCS_RECONNECT_DELAY);
  }
};

const bootstrap = (): void => {
  try {
    app.listen(PORT, async () => {
      console.log(`App is running on port ${PORT}`);
      await connectToMCS();
    });
  } catch (error) {
    console.error(`Failed to start app: ${error}`);
  }
};

bootstrap();
