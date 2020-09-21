import 'reflect-metadata';

import { validateSync } from '../../../src/treenity/model/validate';
import { Meta2 } from './test-types';
import { Meta2 as CustomMeta2 } from './test-custom-types';
import { getSnapshot } from 'mobx-state-tree';

describe('types serialization', () => {
  it('serialization', () => {
    const meta = Meta2.create();
    meta.update(meta => {
      meta.num = 10;
      // @ts-ignore yes, unknown property here
      meta.meta1 = "meta1 string";
      meta.meta2 = "meta2 string";
      // @ts-ignore yes, unknown property here
      meta.pum = 20;
    });

    const obj = getSnapshot(meta);

    expect(obj._t).toBe('meta2');


    expect(obj.meta1).toBeUndefined();
    expect(obj.pum).toBeUndefined();
    expect(obj.meta2).toBe(meta.meta2);

    const meta2 = Meta2.create(obj);
    expect(meta2).toBeDefined();
    // @ts-ignore
    expect(meta2.constructor).toEqual(meta.constructor);
    expect(meta2.num).toEqual(meta.num);
    expect(meta2.meta2).toEqual(meta.meta2);
    expect(meta2._id).toEqual(meta._id);
  });
  it('custom type serialization', () => {
    const meta = CustomMeta2.create();
    meta.update(meta => {
      meta.num = 10;
      // @ts-ignore yes, unknown property here
      meta.meta1 = "meta1 string";
      meta.meta2 = "meta2 string";
      // @ts-ignore yes, unknown property here
      meta.pum = 20;
    })

    const text = serializer.stringify(meta);

    const obj = JSON.parse(text);
    expect(obj._t).toBe('meta21');


    expect(obj.meta1).toBeUndefined();
    expect(obj.pum).toBeUndefined();
    expect(obj.meta2).toBe(meta.meta2);

    const meta2 = serializer.parse(obj);
    expect(meta2).toBeDefined();
    // @ts-ignore
    expect(meta2.constructor).toEqual(meta.constructor);
    expect(meta2.num).toEqual(meta.num);
    expect(meta2.meta2).toEqual(meta.meta2);
    expect(meta2._id).toEqual(meta._id);
  });

  it('validate', () => {
    const meta = new Meta2();
    // meta.num = 10;
    meta.meta1 = "meta1 string";
    meta.meta2 = undefined;
    // meta.meta2 = "meta2 string";
    // @ts-ignore yes, unknown property here
    meta.pum = 20;

    try {
      validateSync(meta, { abortEarly: false });
      expect(false).toBeTruthy();
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.message).toBe('3 errors occurred');
    }
  });
});
