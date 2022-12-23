// import { encrypted_notes_backend } from '../../declarations/encrypted_notes_backend';

// document.querySelector('form').addEventListener('submit', async (e) => {
//   e.preventDefault();
//   const button = e.target.querySelector('button');

//   const name = document.getElementById('name').value.toString();

//   button.setAttribute('disabled', true);

//   // Interact with foo actor, calling the greet method
//   const greeting = await encrypted_notes_backend.greet(name);

//   button.removeAttribute('disabled');

//   document.getElementById('greeting').innerText = greeting;

//   return false;
// });

import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();