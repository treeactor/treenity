import 'reflect-metadata';

import { Schema } from 'yup';
import { immerable } from 'immer';
import { an, getSchemaByType, is as isY, namedSchema, nested as nestedY } from 'yup-decorator';

import { jsonArrayMember, jsonMember, jsonObject } from 'typedjson';
import { ParameterlessConstructor } from 'typedjson/js/typedjson/types';
import { JsonObjectMetadata } from 'typedjson/js/typedjson/metadata';
import { IJsonObjectOptions } from 'typedjson/js/typedjson/json-object';

export const s = an.string();
export const n = an.number();
export const b = an.boolean();

export const a = an.array();
const of = a.of;
a.of = function aof<U>(type: Schema<U>|Function) {
  let isClass = type instanceof Function;
  const ofSchema = isClass ? getSchemaByType(type) : type;
  if (!ofSchema) throw new Error('bad schema type in array.of');

  const schema = of.call(this, ofSchema);
  if (isClass) {
    // @ts-ignore
    schema._subClass = type;
  }
  return schema;
};

export const d = an.date();
export const o = an.object();

export const nested: PropertyDecorator = (target, propKey) => {
  nestedY()(target, propKey);
  jsonMember(target, propKey);
};

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';
function findRootMetaInfo(proto): JsonObjectMetadata {
  const protoProto = Object.getPrototypeOf(proto);
  if (!protoProto || !protoProto[META_FIELD]) {
    return proto[META_FIELD];
  }
  return findRootMetaInfo(protoProto);
}

const schemaNameToType = {
  string: String,
  number: Number,
  date: Date,
  bool: Boolean,
};

export function object(name: string): ClassDecorator {
  return (target: Function) => {
    const parentSchema = getSchemaByType(Object.getPrototypeOf(target));
    namedSchema(name, parentSchema)(target);

    jsonObject({ name })(target as ParameterlessConstructor<any>);
    // find root type meta info in TypedJSON, knownTypes needed to understand our type is from our hierarchy
    findRootMetaInfo(target.prototype).knownTypes.add(target);

    schemaNameToType[name] = target;
  };
}

export function makeObjectDecorator(rootType) {
  return (name: string, options?: IJsonObjectOptions<any>): ClassDecorator => (target: Function) => {
    const parentSchema = getSchemaByType(target);
    namedSchema(name, parentSchema)(target);

    jsonObject({ name, ...options })(target as ParameterlessConstructor<any>);
    // find root type meta info in TypedJSON, knownTypes needed to understand our type is from our hierarchy
    rootType.prototype[META_FIELD].knownTypes.add(target);

    schemaNameToType[name] = target;
  }
}


export function is(schema, type?: Function): PropertyDecorator {
  return (target, propKey) => {
    isY(schema)(target, propKey);
    if (schema._type === 'array') {
      //
      const subType = type || schema._subClass || schemaNameToType[schema._subType._type];
      if (!subType) throw new Error('second argument must be declared for @is array fields');

      jsonArrayMember(subType)(target, propKey);
    } else {
      jsonMember(target, propKey);
    }
  };
}

@object('root')
export class RootClass {
}
RootClass[immerable] = true;
