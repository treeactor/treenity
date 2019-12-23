import * as React from 'react';
import { useEffect, useState } from 'react';
import { produceWithPatches } from 'immer';


import client from '../feathers';
import { WithId } from '../../treenity/meta/meta.model';
import { a, is, o, object, s } from '../../treenity/model/types';
import { createSerializer } from '../../treenity/model/serializer';


function useServiceFind(name, query) {
  const [data, setData] = useState(null);
  useEffect(() => {
    client.service(name).find({ query })
      .then(d => {
        setData(d)
      });
  }, [name]);

  return data;
}

@object('node')
class Node extends WithId {
  @is(s)
  name: string = '';

  @is(o)
  data: object = {};

  @is(a.of(s), String)
  arr: string[] = [];
}

function createSomething() {
  const node = Node.create({
    _id: 'id' + randomId(),
    name: 'name' + randomId(),
    data: { some: 'test' }
  });

  const obj = createSerializer().toPlainJson(node);

  client.service('tree').create(obj);
}

function randomId(): string {
  return Math.random().toString().slice(2, 10);
}

function patchSomething(obj) {
  const [data, patch] = produceWithPatches(obj, draft => {
    draft.name = 'patched' + randomId();
    draft.arr.push('patch test' + randomId());
    delete draft.toDelete;
    draft.deep.house.object.field = new Date();
    draft.deep.house.object.inner = { inner: 1, date: new Date() };
    draft.deep.house.object.arr.push('deep' + randomId());
  });

  client.service('tree').patch(obj._id, patch);
}

export default function Tree({}) {
  const data = useServiceFind('tree', {});

  if (!data)
    return <div>Loading</div>;

  return (<div>
    Tree
    {data.map(d => <p key={d.name}>{d.name} <button onClick={() => patchSomething(d)}>patch</button></p>)}
    <div>
      <button onClick={createSomething}>Create</button>
    </div>
  </div>)
}
