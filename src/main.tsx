import React from 'react';
import ReactDOM from 'react-dom/client';
import 'regenerator-runtime/runtime';
import { RecoilRoot } from 'recoil';
import './index.css';
import { browserRouter } from './Router';
import { RouterProvider } from 'react-router-dom';
// import 'tw-elements-react/dist/css/tw-elements-react.min.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <RecoilRoot>
    <RouterProvider router={browserRouter} />
  </RecoilRoot>,
);
