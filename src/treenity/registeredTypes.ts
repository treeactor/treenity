import { IModelType } from 'mobx-state-tree';

export const registeredTypes: { [type: string]: IModelType<any, any> } = {};

export function addType(type: IModelType<any, any>) {
  return (registeredTypes[type.name] = type);
}
