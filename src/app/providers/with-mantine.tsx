import { ComponentType } from 'react';

import { MantineProvider } from '@mantine/core';

export function withMantine(WrappedComponent: ComponentType) {
  return function wrapper(): JSX.Element | null {
    return (
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <WrappedComponent />
      </MantineProvider>
    );
  };
}
