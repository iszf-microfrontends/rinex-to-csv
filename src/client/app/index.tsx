import { Form } from '@client/features/form';

import { withProviders } from './providers';

function App(): JSX.Element | null {
  return (
    <div>
      <Form />
    </div>
  );
}

export const AppWithProviders = withProviders(App);
