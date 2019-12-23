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
  app.use('nodes', mongoService({
    Model: db.collection('nodes'),
  }));
  app.use('tree', new TreeService());


  app.use('hello', new HelloService());

  const { host, port } = config;

  app.listen({
    host,
    port,
  }, () =>
    console.log(`App is running on http://${host}:${port}`));

}

main().then(console.log, console.error);
