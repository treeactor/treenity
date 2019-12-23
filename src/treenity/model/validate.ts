import { ValidateOptions } from 'yup';
import { getSchemaByType } from 'yup-decorator';

export function validate(obj: any, options?: ValidateOptions) {
  const schema = getSchemaByType(obj);
  return schema.validate(obj, options);
}

export function validateSync(obj: any, options?: ValidateOptions) {
  const schema = getSchemaByType(obj);
  return schema.validateSync(obj, options);
}
