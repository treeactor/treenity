import { types } from 'mobx-state-tree';

export interface Node {
}

export const WithId = types.model('withid', {
  _id: types.string,
});

export const Link = types.model('link', {

});

export const Meta = types.compose('meta', WithId, types.model({
  _tg: types.array(types.string),
  _l: types.array(Link),
})).actions(self => ({
  update(fn) {
    fn(self);
  },
  set(obj) {
    Object.assign(self, obj);
  },
}));

