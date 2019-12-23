import io from 'socket.io-client';

import feathers from '@feathersjs/feathers';
import authentication from '@feathersjs/authentication-client';
import socketio from '@feathersjs/socketio-client';
import config from '../config-common';

const socket = io(`http://${config.host}:${config.port}`);
const client = feathers();

client.configure(socketio(socket));
client.configure(authentication({
  storage: window.localStorage
}));

export default client;
