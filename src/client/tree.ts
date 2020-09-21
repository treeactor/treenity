import { getSnapshot } from 'mobx-state-tree';
import client from './feathers';
import { Node } from '../treenity';

const setUpdatedAt = async context => {
  context.data.setUpdatedAt();

  return context;
}

client.service('tree').hooks({
  before: {
    create(context) {
      // convert mobx object to json
      context.data = getSnapshot(context.data);
      return context;
    },
    // patch: [setUpdatedAt],
  },
  after: {
    find: [function (context) {
      context.result.data = context.result.data.map(snap => Node.create(snap));
      return context;
    }],
  }
});
