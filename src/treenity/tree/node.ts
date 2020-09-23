import { Meta } from '../meta/meta.model';
import { addType, types, t } from '../';

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

function dispatcher(snap) {
  if (snap._t) return types[snap._t].create(snap);

  throw new Error(`type not found: '${snap._t}'`);
}

export const Node = addType(
  t
    .compose(
      'node',
      Meta,
      Timestamp,
      t.model({
        name: t.string,
        _m: t.array(t.union({ dispatcher }, Meta)),
      })
    )
    .actions((self) => ({
      addMeta(meta) {
        self._m.push(meta);
      },
    }))
);
