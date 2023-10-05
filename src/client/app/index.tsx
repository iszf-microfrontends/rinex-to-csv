import { Box, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import Content from '~client/content';

export const App = (): JSX.Element => (
  <MantineProvider withNormalizeCSS>
    <Notifications />
    <Box p="xl">
      <Content />
    </Box>
  </MantineProvider>
);
