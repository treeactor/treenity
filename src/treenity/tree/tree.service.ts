import { Id, NullableId, Params, Service, ServiceMethods } from '@feathersjs/feathers';
import { makeUpdateFromPatch } from '../model/make-patch-update';
import { randomId } from '../../common/random-id';
import assert from 'assert';

const cache = {};
const subscriptions = {};

export default class TreeService implements ServiceMethods<any> {
  // @ts-ignore
  collection: Service<any>;
  app: any;

  setup(app: any, path: string) {
    this.app = app;
    this.collection = app.service('nodes');
    const service = app.service(path);

    service.publish('created', data => {
      return app.channel('anonymous');
    });
    service.publish('patched', data => {
      return app.channel(data.id);
    });
    service.publish('removed', id => {
      return app.channel(id);
    });

    app.on('disconnect', connection => {
      const cookie = connection.headers.cookie;
      delete subscriptions[cookie];
    });
  }

  subscribe(connection, objects) {
    const subId = randomId();
    const cookie = connection.headers.cookie;

    const info = subscriptions[cookie] || (subscriptions[cookie] = { ids: {}, subs: {} });
    const sub: string[] = info.subs[subId] = [];
    const ids = info.ids;

    objects.forEach(o => {
      const id = o._id;
      sub.push(id);
      // increment info count
      const n = ++ids[id.toString()];
      if (Number.isNaN(n)) {
        ids[id] = 1;
        this.app.channel(id.toString()).join(connection);
      }
    });

    return subId;
  }

  unsubscribe(connection, subId) {
    const cookie = connection.headers.cookie;
    const info = subscriptions[cookie];
    const sub = info.subs[subId];
    delete info.subs[subId];

    const ids = info.ids;

    sub.forEach(id => {
      const n = --ids[id];
      assert(n >= 0, 'invalid id');
      if (n === 0) {
        delete ids[id];
        this.app.channel(id).leave(connection);
      }
    })
  }

  async find(params: Params) {
    const { subscribe, subId,  ...query } = params.query;
    if (subscribe === false) {
      this.unsubscribe(params.connection, subId);
      return null;
    }

    const objects = await this.collection.find({ query });
    if (subscribe === true) {
      const subId = this.subscribe(params.connection, objects);

      return { objects, subId };
    }
    return objects;
  }

  async get(id: Id, params: Params) {
    return this.collection.get(id);
  }
  async create(data: any, params: Params) {
    const obj = await this.collection.create(data, params);
    return obj;
  }
  // async update(id: NullableId, data: any, params: Params) {
  //   console.log('updating');
  // }
  async patch(id: NullableId, patch: any, params: Params) {
    const update = makeUpdateFromPatch('', patch);
    update.$inc = { _r: 1 };

    console.log('patching', id, patch);

    const obj = await this.collection.patch(id, update);

    // this.emit('patched', { id, patch });
    return { id, r: obj._r, patch };
    // return patch;
    // this.emit(id, patch);
    // this.app.channel(id).send(patch);
  }
  async remove(id: NullableId, params: Params) {
    await this.collection.remove(id);
    return id;
  }
}
