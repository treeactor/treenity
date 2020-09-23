import { IModelType } from 'mobx-state-tree';

export const types: { [type: string]: IModelType<any, any> } = {};

export function addType(type: IModelType<any, any>) {
  return (types[type.name] = type);
}
