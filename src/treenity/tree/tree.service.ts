import { ServiceMethods, Params, Id, NullableId, Service } from '@feathersjs/feathers';

export default class TreeService implements ServiceMethods<any> {
  collection: Service<any>;
  app: any;

  async find(params: Params) {
    return this.collection.find(params);
  }
  async get(id: Id, params: Params) {
    return this.collection.get(id);
  }
  async create(data: any, params: Params) {
    return this.collection.create(data, params);
  }
  async update(id: NullableId, data: any, params: Params) {
    console.log('updating');
  }
  async patch(id: NullableId, data: any, params: Params) {
    console.log('patching', data, params);
  }
  async remove(id: NullableId, params: Params) {}

  setup(app: any, path: string) {
    this.app = app;
    this.collection = app.service('nodes');
  }
}
