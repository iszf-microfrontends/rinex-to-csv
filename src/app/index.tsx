import { withProviders } from './providers';

function App(): JSX.Element | null {
  return <div>Hello! I am Rinex-to-csv</div>;
}

export const AppWithProviders = withProviders(App);
