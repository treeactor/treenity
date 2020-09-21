import { types as t } from 'mobx-state-tree';
import { withUpdate } from './test-types.js';

const Inner = t.model('Inner',  {
  param1: 0,
});

const Meta = t.model('Meta',  {
  str: "",
  num: t.maybe(t.number),
  arr: t.array(t.string),
  innerArr: t.optional(t.array(Inner), () => ([Inner.create({ param1: 42 })])),
  inner: t.maybe(Inner),
});
export default Meta;

export const Meta1 = t.model('Meta1',  {
  meta1: "",
});

export const Meta2 = withUpdate(t.model('Meta2',  {
  meta2: "",
}));

