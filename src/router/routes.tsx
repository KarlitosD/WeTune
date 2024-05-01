import { lazy } from 'solid-js';
import { Router, RouteDefinition, redirect } from '@solidjs/router';

import App from '~/app';

import HomeWrapper from '~/layouts/main';

import Home from '~/pages/home';

import Results from '~/pages/results';
import { searchResults } from '~/pages/results.data';

import PlaylistPage from '~/pages/playlist/[playlistId]';

import ShareSong from '~/pages/share/song';
import { getSongData } from '~/pages/share/song.data';

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
        load: ({ location }) => searchResults(location.query.search)
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
      
      fetch(`/api/songs?song=${searchParams.get("songId")}`)
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

