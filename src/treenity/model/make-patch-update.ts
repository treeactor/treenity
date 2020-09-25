import { applyAction, getSnapshot, IJsonPatch, ISerializedActionCall } from 'mobx-state-tree';
import { getPatches } from '../../mst/get-actions';

type Operator = { [key: string]: any };

export interface Update {
  $set?: Operator;
  $unset?: Operator;
  $inc?: Operator;
  $pushAll?: { [key: string]: any[] };
  $push?: Operator;
  $pull?: Operator;
}

export function makeUpdateFromActions(
  typeName: string,
  mst: any,
  actions: readonly ISerializedActionCall[]
): [readonly Update[], readonly IJsonPatch[]] {
  const patches = getPatches(mst, () => {
    actions.forEach((action) => applyAction(mst, action));
  });
  return [makeUpdateFromPatch(typeName, patches), patches];
}

export function makeUpdateFromPatch(typeName: string, patches: readonly IJsonPatch[]): readonly Update[] {
  // const schema = getNamedSchema(typeName);

  const update = {} as Update;
  let $pull;

  for (let i = 0; i < patches.length; i++) {
    const patch = patches[i];

    const path = patch.path.substr(1).split('/');
    const pathStr = path.join('.');

    switch (patch.op) {
      // case 'add':
      //   const sh = reach(schema, pathStr);
      //   if (sh._type === 'array') {
      //     if (update.$pushAll?.[pathStr]) {
      //       update.$pushAll[pathStr].push(patch.value);
      //     } else if (update.$push?.[pathStr]) { // already have push, need push all for multiple items
      //       update.$pushAll = update.$pushAll || {};
      //       update.$pushAll[pathStr] = [update.$push?.[pathStr], patch.value];
      //     } else {
      //       update.$push = update.$push || {};
      //       update.$push[pathStr] = patch.value;
      //     }
      //   } else {
      //     update.$set = update.$set || {};
      //     update.$set[pathStr] = patch.value;
      //   }
      // } break;
      //
      case 'add':
      case 'replace':
        update.$set = update.$set || {};
        // if this is
        update.$set[pathStr] =
          typeof patch.value === 'object' && patch.value.constructor !== Object
            ? getSnapshot(patch.value)
            : patch.value;

        break;

      case 'remove':
        update.$unset = update.$unset || {};
        update.$unset[pathStr] = true;
        if (!Number.isNaN(+path[path.length - 1])) {
          // XXX for arrays also remove unset values // still no removal by index in mongo
          $pull = $pull || {};
          $pull[path.slice(0, -1).join('.')] = null;
        }

        break;
    }
  }

  const updates = [update];
  if ($pull) updates.push({ $pull });

  return updates;
}
