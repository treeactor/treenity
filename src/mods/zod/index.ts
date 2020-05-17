import * as z from 'zod';
import { ZodError } from '../../../lib/zod/src';

declare module zod {
  export interface ZodType<Type, TypeDef> {
    validate(u: unknown => string): z.ZodType<Type, z.TypeDef>;
  }
}

z.ZodType.prototype.validate = function (validator: (u: unknown) => string|false|undefined) {
  const originalParse = this.parse;
  this.parse = function (obj) {
    originalParse.call(this, obj);
    let error = validator(obj);
    if (error) {
      throw ZodError.fromString(error);
    }
  };
  return this;
};

const positive = num => (num <= 0 && 'Not positive');

const zodSchema = z.object({
  str: z.string(),
  ostr: z.ostring(),
  obj: z.object({
    some: z.number()
      .data({ form: { type: 'textarea' } })
      .validate(positive)
  }),
});

try {
  const x = zodSchema.parse({
    str: 'test',
    obj: { some: -10 },
  });

} catch (err) {
  console.log(err, err.path);
}

