
import { a, is, makeObjectDecorator, n, nested, RootClass, s } from '../../../src/treenity/model/types';
import { WithId } from '../../../src/treenity/meta/meta.model';

const object = makeObjectDecorator(RootClass);

@object('inner1')
class Inner extends RootClass {
  @is(n.required())
  param1: number = 0;

  constructor(p1?: number) {
    super();
    this.param1 = p1 || 0;
  }
}

@object('meta1')
export default class Meta extends WithId {
  @is(s.required())
  str: string = "";

  @is(n.positive())
  num?: number;

  @is(a.of(s))
  arr: string[] = [];

  @is(a.of(Inner))
  innerArr: Inner[] = [new Inner(42)];

  @nested
  inner?: Inner;
}

@object('meta11')
export class Meta1 extends Meta {
  @is(s)
  public meta1: string = "";
}

@object('meta21')
export class Meta2 extends Meta {
  @is(s)
  public meta2: string = "";
}

