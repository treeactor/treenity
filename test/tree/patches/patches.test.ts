import produce, { produceWithPatches } from 'immer';

import { a, is, n, nested, object, RootClass, s } from '../../../src/treenity/model/types';
import { createSerializer } from '../../../src/treenity/model/serializer';

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
  @nested
  public deep: Deeper = new Deeper();
}


@object('topatch')
class ToPatch extends RootClass {
  @is(a.of(s))
  public strings: string[] = [];

  @is(s)
  public str: string = '';

  @nested
  inner: Inner = new Inner('topatch');

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

      delete draft.num;
    });

    expect(newObj).toBeInstanceOf(ToPatch);

    expect(patch).toBeDefined();
  })
});
