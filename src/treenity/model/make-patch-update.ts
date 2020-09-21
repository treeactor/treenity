import { applyAction, getSnapshot, IJsonPatch, ISerializedActionCall } from 'mobx-state-tree';
import { getPatches } from '../../mst/get-actions';

export interface Update {
  $set?: object;
  $unset?: object;
  $inc?: object;
  $pushAll?: { [key: string]: any[] };
  $push?: object;
}

export function makeUpdateFromActions(
  typeName: string,
  mst: any,
  actions: ISerializedActionCall[]
): [Update, IJsonPatch[]] {
  const patches = getPatches(mst, () => {
    actions.forEach((action) => applyAction(mst, action));
  });
  return [makeUpdateFromPatch(typeName, patches), patches];
}

export function makeUpdateFromPatch(typeName: string, patches: IJsonPatch[]): Update {
  // const schema = getNamedSchema(typeName);

  const update = {} as Update;

  for (let i = 0; i < patches.length; i++) {
    const patch = patches[i];

    const path = patch.path.substr(1).replace('/', '.');

    switch (patch.op) {
      // case 'add':
      //   const sh = reach(schema, path);
      //   if (sh._type === 'array') {
      //     if (update.$pushAll?.[path]) {
      //       update.$pushAll[path].push(patch.value);
      //     } else if (update.$push?.[path]) { // already have push, need push all for multiple items
      //       update.$pushAll = update.$pushAll || {};
      //       update.$pushAll[path] = [update.$push?.[path], patch.value];
      //     } else {
      //       update.$push = update.$push || {};
      //       update.$push[path] = patch.value;
      //     }
      //   } else {
      //     update.$set = update.$set || {};
      //     update.$set[path] = patch.value;
      //   }
      // } break;
      //
      case 'add':
      case 'replace':
        update.$set = update.$set || {};
        // if this is
        update.$set[path] =
          typeof patch.value === 'object' && patch.value.constructor !== Object
            ? getSnapshot(patch.value)
            : patch.value;

        break;

      case 'remove':
        update.$unset = update.$unset || {};
        update.$unset[path] = true;

        break;
    }
  }

  return update;
}
