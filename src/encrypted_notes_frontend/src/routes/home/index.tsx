import { Button, Input, InputGroup } from '@chakra-ui/react';
import { useState } from 'react';

import { encrypted_notes_backend } from '../../../../declarations/encrypted_notes_backend';

export const Home = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  async function doGreet() {
    const greeting = await encrypted_notes_backend.greet(name);
    setMessage(greeting);
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: '30px' }}>
        <h1>Home</h1>
        <p>Greetings, from DFINITY!</p>
        <p>
          {' '}
          Type your message in the Name input field, then click{' '}
          <b> Get Greeting</b> to display the result.
        </p>
      </div>
      <div style={{ margin: '30px' }}>
        <InputGroup>
          <Input
            id="name"
            placeholder="Type text here"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <Button onClick={doGreet}>Get Greeting!</Button>
        </InputGroup>
      </div>
      <div>
        Greeting is: "<span style={{ color: 'green' }}>{message}</span>"
      </div>
    </div>
  );
};

export default Home;
