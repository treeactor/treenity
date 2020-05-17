import produce, { Patch, produceWithPatches } from 'immer';
import { getSchemaByType } from 'yup-decorator';

import { a, is, n, nested, object, RootClass, s } from '../../../src/treenity/model/types';
import { createSerializer, nameof } from '../../../src/treenity/model/serializer';
import { makeUpdateFromPatch } from '../../../src/treenity/model/make-patch-update';

@object('topatch.deeper')
class Deeper extends RootClass {
  @is(s.required())
  public deeper: string = '';
}

@object('topatch.inner')
class Inner extends RootClass {
  constructor(str) {
    super();

    this.str = str;
  }

  @is(s.required())
  public str: string;

  @is(n)
  public num?: number;

  @nested
  public deep: Deeper = new Deeper();
}

@object('topatch.inner2')
class Inner2 extends Inner {
  @is(n)
  public num2: number = 56;
}


@object('topatch')
class ToPatch extends RootClass {
  @is(a.of(s))
  public strings: string[] = [];

  @is(s)
  public str: string = '';

  @nested
  inner: Inner = new Inner('topatch');

  @nested
  inner2?: Inner;

  @is(n)
  num?: number = 5;
}

describe('immer to service patch', () => {
  const serializer = createSerializer();

  it('immer patch to service', () => {

    const toPatch = new ToPatch();

    const [newObj, patch] = produceWithPatches(toPatch, draft => {
      draft.str = 'test str';
      draft.strings.push('some stirng');
      draft.strings.push('another string');
      // draft.inner = new Inner('draft');
      draft.inner.deep.deeper = 'deeeeper';
      draft.inner.str = 'draft-more';
      draft.inner.num = 42;

      draft.inner2 = new Inner2('topatch2');

      delete draft.num;
    });

    expect(newObj).toBeInstanceOf(ToPatch);

    const typeName = getSchemaByType(ToPatch).name;

    const update = makeUpdateFromPatch(typeName, patch);
    expect(update.$set['inner.deep.deeper']).toBe('deeeeper');
    expect(update.$set['inner.num']).toBe(42);


    expect(patch).toBeDefined();
  })
});
