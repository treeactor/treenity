import { a, is, o, object, s } from '../model/types';
import { WithId } from '../meta/meta.model';

@object('node')
export class Node extends WithId {
  @is(s)
  name: string = '';

  @is(o)
  data: object = {};

  @is(a.of(s), String)
  arr: string[] = [];
}
