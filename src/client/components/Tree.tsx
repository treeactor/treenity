import React from 'react';
import { Link } from 'react-router-dom';

import { produceWithPatches } from 'immer';


import client from '../feathers';
import { createSerializer } from '../../treenity/model/serializer';
import { Node } from '../../treenity/tree/node';
import { useServiceFind } from '../utils/useServiceFind';
import { randomId } from '../../common/random-id';


function createSomething() {
  const node = Node.create({
    _id: 'id' + randomId(),
    name: 'name' + randomId(),
    data: { some: 'test' },
  });

  const obj = createSerializer().toPlainJson(node);

  client.service('tree').create(obj);
}

function patchSomething(obj: Node) {
  const [data, patch] = produceWithPatches(obj, draft => {
    draft.name = 'patched' + randomId();
  });

  return client.service('tree').patch(obj._id, patch);
}

function removeSomething(obj: Node) {
  return client.service('tree').remove(obj._id);
}

export default function Tree({}) {
  const data = useServiceFind('tree', {});

  if (!data) {
    return <div>Loading</div>;
  }

  return (<div style={{ padding: 16 }}>
    <h3>Tree</h3>
    {data.map(d => <p key={d.name}>{d.name}
      <button style={{ marginLeft: 8 }} onClick={() => patchSomething(d)}>patch</button>
      <button style={{ marginLeft: 4 }} onClick={() => removeSomething(d)}>remove</button>
    </p>)}
    <div>
      <button onClick={createSomething}>Create</button>
    </div>
    <div style={{ marginTop: 48 }}>
      <Link href="/craft">Craft</Link>
    </div>
  </div>);
}
