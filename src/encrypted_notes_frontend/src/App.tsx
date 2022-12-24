import React from 'react';

import { encrypted_notes_backend } from '../../declarations/encrypted_notes_backend'

function App() {
  const handleGreeting = async () => {
    const name = "Alice"
    const greeting = await encrypted_notes_backend.greet(name)
    alert(`${greeting}`)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <button onClick={handleGreeting}>Push Greet!</button>
        </h1>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
