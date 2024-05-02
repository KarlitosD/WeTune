import { RouteSectionProps } from '@solidjs/router';
import { Meta, MetaProvider } from '@solidjs/meta';

import { Header } from '~/components/Layout/Header';
import { PlaylistProvider } from '~/context/playlist';

export default function App (props: RouteSectionProps) {
  return (
    <>
    <MetaProvider>
        <Meta name="robots" content="noindex, nofollow" />
        <Header />
        <PlaylistProvider>
          {props.children}
        </PlaylistProvider>
      </MetaProvider>
    </>
  );
};
