import { RouteSectionProps } from '@solidjs/router';
import { MetaProvider } from '@solidjs/meta';

import TypesafeI18n from './i18n/i18n-solid'

import { Header } from '~/components/Layout/Header';
import Toaster from '~/components/Toaster';
import { PlaylistProvider } from '~/context/playlist';
import { loadPreferredLocale } from './utils/i18n';

const localePreference = await loadPreferredLocale()

export default function App (props: RouteSectionProps) {
  return (
    <>
      <TypesafeI18n locale={localePreference}>
        <MetaProvider>
          <Header />
          <PlaylistProvider>
            {props.children}
          </PlaylistProvider>
          <Toaster />
        </MetaProvider>
      </TypesafeI18n>
    </>
  );
};
