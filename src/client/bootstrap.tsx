import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { MantineProvider } from '@mantine/core';

import { MainComponent } from './main-component';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <MainComponent />
    </MantineProvider>
  </StrictMode>,
);
