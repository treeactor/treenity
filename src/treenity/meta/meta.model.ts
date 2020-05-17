import { getNamedSchema, getSchemaByType } from 'yup-decorator';
import { n, s, a, nested, is, object, RootClass } from '../model/types';
import { createSerializer } from '../model/serializer';

@object('base')
export class Base extends RootClass {
  public static create<T>(this: { new(): T }, data?: object): T {
    const obj = new this();
    if (data) {
      Object.assign(obj, data);
    }
    return obj;
  }

  update() {

  }
}

@object('withId')
export class WithId extends Base {
  @is(s.required())
  _id: string = 'id';

}

export interface Node {
}


@object('link')
export class Link {
  @is(s.required())
  readonly rm: Id; // remote meta id
  @is(s.required())
  readonly rp: string; // remote path

  @is(s)
  readonly lm?: Id; // local meta
  @is(s.required())
  readonly lp: string; // local path

  constructor(rm, rp, lp, lm?) {
    this.rm = rm;
    this.lp = lp;
    this.rp = rp;
    this.lm = lm;
  }
}

@object('meta')
export default class Meta extends WithId {
  @is(a.of(s))
  _tg?: string[];
  @is(a.of(Link))
  _l?: Link[];

  readonly node: Node;
}

type Id = string;

@object('node')
export class Node extends Meta {
  @is(s.required())
  // @ts-ignore will be filled while object initialization
  public _p: Id = '';
  @is(a.of(s).required())
  // @ts-ignore
  public _pa: Id[] = [];

  // @ts-ignore
  // @is(a.of(Meta).required())
  // public _m: Meta[] = [];
  //
  // @is(a.of(Link).required())
  // public _l: Link[] = [];

  constructor() {
    super();

    this._m.forEach(m => m.node = this);
  }
  // constructor(json) {
  //   super();
  //
  //   let serializer = createSerializer();
  //   this._m = json._m.map(m => serializer.parse(m));
  //   this._l = json._l.map()
  // }

}

// definePresentation(Meta, {
//   str: {
//     columnWidth: 20,
//   },
//   // ...
// });
