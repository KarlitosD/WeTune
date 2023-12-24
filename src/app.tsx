import { useRoutes } from '@solidjs/router';

import { routes } from './router/routes';
import { Header } from './components/Layout/Header';
import { PlaylistProvider } from './context/playlist';



const App = () => {
  const Route = useRoutes(routes)

  return (
    <>
      <Header />

      <PlaylistProvider>
          <Route />
      </PlaylistProvider>
    </>
  );
};

export default App;
