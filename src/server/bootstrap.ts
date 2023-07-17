import { execSync } from 'child_process';
import express from 'express';
import path from 'path';

const config = process.env;

const app = express();

app.use(express.static(path.resolve(__dirname, '..', '..', 'dist/client')));

const server = app.listen(config.PORT, () => {
  console.log(`Microfrontend is running on port ${config.PORT}`);
  connectMicrofrontendToMSC();
});

server.on('close', () => {
  console.log('Microfrontend has been closed');
  disconnectMicrofrontendFromMSC();
});

exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');

function exitOnSignal(signal: string) {
  process.on(signal, () => {
    server.close((error) => {
      process.exit(error ? 1 : 0);
    });
  });
}

function connectMicrofrontendToMSC() {
  try {
    const body = JSON.stringify({
      name: config.MICROFRONTEND_NAME,
      url: `${config.DOMAIN}:${config.PORT}`,
      scope: config.MODULE_FEDERATION_SCOPE,
      component: config.MAIN_EXPOSED_COMPONENT,
      backendName: config.BACKEND_NAME,
    }).replace(/"/g, '\\"');
    execSync(
      `curl -s -X POST -H "Content-Type: application/json" -d "${body}" ${config.MICROFRONTEND_CONTROL_SERVER_URL}/api/v1/microfrontends/start`,
    );
    console.log('Microfrontend successfully connected to MCS');
  } catch (error) {
    console.log(`Failed connecting microfrontend to MCS: ${error}`);
    throw error;
  }
}

function disconnectMicrofrontendFromMSC() {
  try {
    execSync(
      `curl -s -X GET -H "Content-Type: application/json" ${config.MICROFRONTEND_CONTROL_SERVER_URL}/api/v1/microfrontends/close?name=${config.MICROFRONTEND_NAME}`,
    );
    console.log('Microfrontend successfully disconnected from MCS');
  } catch (error) {
    console.log(`Failed disconnecting microfrontend from MCS: ${error}`);
    throw error;
  }
}
