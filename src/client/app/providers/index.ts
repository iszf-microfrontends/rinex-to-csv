import compose from 'compose-function';

import { withMantine } from './with-mantine';

export const withProviders = compose(withMantine);
