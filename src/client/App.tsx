import * as React from 'react';
import { useEffect, useState } from 'react';
import Tree from './components/Tree';
import client from './feathers';

export function App() {
  const [connected, setConnected] = useState(true);
  useEffect(() => {
    client.io.on('connection', () => {
      setConnected(true);
    });
  });


  return connected
      ? <Tree />
      : <div>Connecting...</div>;
}
