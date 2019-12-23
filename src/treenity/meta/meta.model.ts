import { getNamedSchema, getSchemaByType } from 'yup-decorator';
import { n, s, a, nested, is, object, RootClass } from '../model/types';

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

export default class Meta extends WithId {

}

// definePresentation(Meta, {
//   str: {
//     columnWidth: 20,
//   },
//   // ...
// });
