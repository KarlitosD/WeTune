/* @refresh reload */

import { render } from 'solid-js/web';
import { Routes } from './router/routes';
import '@solid-devtools/debugger/setup'

import "./index.css"

const root = document.getElementById('root');

if(import.meta.env.DEV) {
  const { attachDevtoolsOverlay } = await import('@solid-devtools/overlay')
  attachDevtoolsOverlay()
}

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?',
  );
}
render(Routes, root);