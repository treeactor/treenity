import { types } from 'mobx-state-tree';
import produce, { Patch, produceWithPatches } from 'immer';

import { makeUpdateFromPatch } from '../../../src/treenity/model/make-patch-update';

const Deeper = types.model('topatch.deeper', {
  deeper: '',
});


const Inner = types.model('topatch.inner', {
  str: types.string,

  num: types.maybe(types.number),

  deep: Deeper,
});

const Inner2 = types.model('topatch.inner2', {
  str: '',
  num2: 56,
});


const ToPatch = types.model('topatch', {
  strings: types.array(types.string),

  str: '',

  inner: types.optional(
    Inner,
    () => Inner.create({ str: 'topatch', deep: Deeper.create() }),
  ),

  inner2: types.maybe(Inner),

  num: types.maybe(types.optional(types.number, 5)),
});

describe('immer to service patch', () => {
  it('immer patch to service', () => {

    const toPatch = ToPatch.create();

    const [newObj, patch] = produceWithPatches(toPatch, (draft: typeof toPatch) => {
      draft.str = 'test str';
      draft.strings.push('some stirng');
      draft.strings.push('another string');
      // draft.inner = new Inner('draft');
      draft.inner.deep.deeper = 'deeeeper';
      draft.inner.str = 'draft-more';
      draft.inner.num = 42;

      draft.inner2 = Inner2.create({ str: 'topatch2' });

      delete draft.num;
    });

    expect(newObj).toBeInstanceOf(ToPatch);

    const typeName = getSchemaByType(ToPatch).name;

    const update = makeUpdateFromPatch(typeName, patch);
    expect(update.$set['inner.deep.deeper']).toBe('deeeeper');
    expect(update.$set['inner.num']).toBe(42);


    expect(patch).toBeDefined();
  });
});
