import 'reflect-metadata';

import { TypedJSON } from 'typedjson';
import { Constructor, IndexedObject } from 'typedjson/js/typedjson/types';
import { JsonObjectMetadata } from 'typedjson/js/typedjson/metadata';

import { RootClass } from './types';

export function nameof(fn: Function & { name?: string }) {
  return fn.name || 'undefined';
}

function typeResolver(sourceObject: any, knownTypes: Map<string, Function>): Function|undefined {
  return knownTypes.get(sourceObject._t);
}
function typeHintEmitter(
  targetObject: IndexedObject,
  sourceObject: IndexedObject,
  expectedSourceType: Function,
  sourceTypeMetadata?: JsonObjectMetadata,
) {
  // By default, we put a "_t" property on the output object if the actual object is not the
  // same as the expected one, so that deserialization will know what to deserialize into (given
  // the required known-types are defined, and the object is a valid subtype of the expected type).
  if (sourceObject.constructor !== expectedSourceType) {
    targetObject._t = sourceTypeMetadata && sourceTypeMetadata.name || nameof(sourceObject.constructor);
  }
}


export const createSerializer: (() => TypedJSON<any>) = () => {
  const serializer = new TypedJSON(RootClass as Constructor<any>, {
    typeResolver,
    typeHintEmitter,
  });

  return serializer;
};
