import { lazy } from 'solid-js';
import { Router, RouteDefinition, redirect } from '@solidjs/router';
import { fetch } from "@tauri-apps/plugin-http"

import App from '~/app';

import HomeWrapper from '~/layouts/main';

import Home from '~/pages/home';

import Results from '~/pages/results';
import { searchResults } from '~/pages/results.data';

import PlaylistPage from '~/pages/playlist/[playlistId]';

import ShareSong from '~/pages/share/song';
import { getSongData } from '~/pages/share/song.data';
import { getApiUrl } from '~/config';

const Playground = lazy(() => import('~/pages/playground'));
const NotFound = lazy(() => import('~/pages/404'));

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: HomeWrapper,
    children: [
      {
        path: "",
        component: Home
      },
      {
        path: "/results",
        component: Results,
        load: ({ location }) => searchResults(location.query.search as string)
      },{
        path: "/playlist/:playlistId",
        component: PlaylistPage,
      },
      {
        path: "/playground",
        component: Playground
      }
    ],
  },
  {
    path: "/share/song",
    component: ShareSong,
    load: async ({ location }) => {
      const searchParams = new URLSearchParams(location.search)
      if(!searchParams.get("songId")) redirect("/")
      
      fetch(getApiUrl(`song/blob?songId=${searchParams.get("songId")}`))
      await getSongData(searchParams.get("songId"))
    }
  },
  {
    path: '*404',
    component: NotFound,
  },
];

export function Routes () {
  return (
    <Router root={App}>
      {routes}
    </Router>
  )
}

