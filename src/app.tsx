import { RouteSectionProps } from '@solidjs/router';
import { Header } from './components/Layout/Header';
import { PlaylistProvider } from './context/playlist';

export default function App (props: RouteSectionProps) {
  return (
    <>
      <Header />
      <PlaylistProvider>
        {props.children}
      </PlaylistProvider>
    </>
  );
};
