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
        <h1 className="text-red-600">
          Hello World!
        </h1>
        <div>
          <button onClick={handleGreeting}>Push Greet!</button>
        </div>

      </header>
    </div>
  );
}

export default App;
