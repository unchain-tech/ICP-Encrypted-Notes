import { Router } from './router/Router'
// import { encrypted_notes_backend } from '../../declarations/encrypted_notes_backend'

function App() {
  // const handleGreeting = async () => {
  //   const name = "Alice"
  //   const greeting = await encrypted_notes_backend.greet(name)
  //   alert(`${greeting}`)
  // }

  return (
    <div>
      {/* <h1 className="text-red-600">
        Hello ICP!
      </h1>
      <div>
        <button onClick={handleGreeting}>Push Greet!</button>
      </div> */}
      <Router />
    </div>
  )
}

export default App;
