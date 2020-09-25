import helmet from 'helmet';
import cors from 'cors';

import feathers from '@feathersjs/feathers';
import express from '@feathersjs/express';
import mongoService from 'feathers-mongodb';
import socketio from '@feathersjs/socketio';
import configuration from '@feathersjs/configuration';

import '../common/index';

import config from '../config-common';

import { HelloService } from '../mods/server';
import createClientDb from '../mods/mongo/mongod';
import TreeService from '../treenity/tree/tree.service';
import MessageService from '../treenity/message/message.service';

async function main() {
  const app = express(feathers());

  app.configure(configuration());

  app.use(helmet());
  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.configure(express.rest());
  app.configure(socketio());
  app.use(express.errorHandler());

  const db = await createClientDb(app);
  app.use(
    'nodes',
    mongoService({
      Model: db.collection('nodes'),
    })
  );
  app.use(
    'changes',
    mongoService({
      Model: db.collection('changes'),
    })
  );
  app.use('tree', new TreeService());
  app.service('tree').hooks({
    error: {
      all: [console.error],
    },
  });

  app.use('message', new MessageService());

  app.use('hello', new HelloService());

  const { host, port } = config;

  app.listen(
    {
      host,
      port,
    },
    () => {
      console.log(`App is running on http://${host}:${port}`);

      app.on('connection', (connection) => {
        // app.channel('tree').join(connection);
        app.channel('anonymous').join(connection);
      });

      // app.service('tree').publish('patched', data => {
      // return app.channel('tree');
      // });
    }
  );
}

main().then(console.log, console.error);
