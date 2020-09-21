import { types } from 'mobx-state-tree';
import { Meta } from '../meta/meta.model';

export const Timestamp = types.model('timestamp', {
  createdAt: types.optional(types.Date, () => new Date),
  updatedAt: types.optional(types.Date, () => new Date),
})
  .actions(self => ({
    setUpdatedAt() {
      self.updatedAt = new Date;
    },
  }));

export const Node = types.compose('node', Meta, Timestamp, types.model({
  name: types.string,
  _m: types.array(Meta),
}));
