import { jsonMember, jsonObject, TypedJSON } from 'typedjson';
import { JsonObjectMetadata } from 'typedjson/js/typedjson/metadata';
import { IJsonObjectOptions } from 'typedjson/js/typedjson/json-object';
import { ParameterlessConstructor } from 'typedjson/js/typedjson/types';

const META_FIELD = '__typedJsonJsonObjectMetadataInformation__';

function findRootMetaInfo(proto): JsonObjectMetadata {
  const protoProto = Object.getPrototypeOf(proto);
  if (!protoProto || !protoProto[META_FIELD]) {
    return proto[META_FIELD];
  }
  return findRootMetaInfo(protoProto);
}

export function object(name: string, options?: IJsonObjectOptions<any>): ClassDecorator {
  return (target: Function) => {
    jsonObject({ name, ...options })(target as ParameterlessConstructor<any>);
    // find root type meta info in TypedJSON, knownTypes needed to understand our type is from our hierarchy
    findRootMetaInfo(target.prototype).knownTypes.add(target);
  };
}

function makeObjectDecorator(rootType) {
  return (name: string, options?: IJsonObjectOptions<any>): ClassDecorator => (target: Function) => {
    jsonObject({ name, ...options })(target as ParameterlessConstructor<any>);
    rootType.prototype[META_FIELD].knownTypes.add(target);
  }
}

// ..........

@object('root')
class RootType {
  @jsonMember
  public _id: string = "";
}

@object('childType')
class ChildType extends RootType {

}

const serializer = new TypedJSON(RootType);
