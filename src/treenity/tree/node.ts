import { Meta } from '../meta/meta.model';
import { addType, registeredTypes, t } from '../';
import { getSnapshot, IAnyType, Instance, isStateTreeNode } from 'mobx-state-tree';
import { untrack } from '../../mst/get-actions';

export const Timestamp = addType(
  t
    .model('timestamp', {
      createdAt: t.optional(t.Date, () => new Date()),
      updatedAt: t.optional(t.Date, () => new Date()),
    })
    .actions((self) => ({
      setUpdatedAt() {
        self.updatedAt = new Date();
      },
    }))
);

function dispatcher(snap: any): IAnyType {
  if (snap._t) return registeredTypes[snap._t];

  throw new Error(`type not found: '${snap._t}'`);
}

// fake type to create right meta type by its type-string
const UnionMeta = Meta.named('union-meta');
// @ts-ignore
UnionMeta.isAssignableFrom = function (snap) {
  return true;
};

const NodeModel = t.compose(
  'node',
  Meta,
  Timestamp,
  t.model({
    name: t.string,
    _p: t.string,
    _r: t.optional(t.number, 0),
    _m: t.array(t.union({ dispatcher }, UnionMeta)),
  })
);

export const Node = addType(
  NodeModel.actions((self: Instance<typeof NodeModel>) => ({
    // addMeta: untrack((meta) => {
    //   self._addMeta(getSnapshot(meta));
    // }),
    $addMeta(meta) {
      const snapshot = isStateTreeNode(meta) ? getSnapshot(meta) : meta;
      return self.addMetaSnapshot(snapshot);
    },
    addMetaSnapshot(metaSnapshot) {
      self._m.push(metaSnapshot);
    },

    $removeMeta(idOrMeta: string | IAnyType) {
      if (isStateTreeNode(idOrMeta)) {
        // @ts-ignore
        idOrMeta = (idOrMeta as Instance<typeof Meta>)._id;
      }
      return self.removeMetaId(idOrMeta);
    },
    removeMetaId(_id: string) {
      const idx = self._m.findIndex((m) => m._id === _id);
      if (idx >= 0) {
        self._m.splice(idx, 1);
        return true;
      }

      return false;
    },
  }))
);
