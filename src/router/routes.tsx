import { lazy } from 'solid-js';
import { Router, RouteDefinition } from '@solidjs/router';

import App from '~/app';

import HomeWrapper from '~/layouts/main';

import Home from '~/pages/home';

import Results from '~/pages/results';
import { searchResults } from '~/pages/results.data';


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
      },

    ]
  },
  {
    path: '*404',
    component: lazy(() => import('../pages/404')),
  },
];

export function Routes () {
  return (
    <Router root={App}>
      {routes}
    </Router>
  )
}

