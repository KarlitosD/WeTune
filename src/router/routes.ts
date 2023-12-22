import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import HomeWrapper from '../layouts/main';
import Home from '../pages/home';

import * as loaders from "./loaders"
import Results from '../pages/results';

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
        data: loaders.resultsData
      },

    ]
  },
  {
    path: '**',
    component: lazy(() => import('../pages/404')),
  },
];

