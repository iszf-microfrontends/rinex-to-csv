import { Box, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import Content from '~/content';

export const App = (): JSX.Element => (
  <MantineProvider withNormalizeCSS>
    <Notifications />
    <Box p={20}>
      <Content />
    </Box>
  </MantineProvider>
);
