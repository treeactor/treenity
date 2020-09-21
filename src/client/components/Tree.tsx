import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import client from '../feathers';
import { Node } from '../../treenity/tree/node';
import { useServiceFind } from '../utils/useServiceFind';
import { randomId } from '../../common/random-id';
import { getActions } from '../../mst/get-actions';

function createSomething() {
  const node = Node.create({
    _id: 'id' + randomId(),
    name: 'name' + randomId(),
    data: { some: 'test' },
  });

  client.service('tree').create(node);
}

function patch(node: Node, updater) {
  const actions = getActions(node, updater);

  return client.service('tree').patch(node._id, actions);
}

function remove(node: Node) {
  return client.service('tree').remove(node._id);
}

export default observer(function Tree({}) {
  const nodes = useServiceFind('tree', {});

  const patchSomething = (n) =>
    patch(n, (n) => {
      n.set({ name: 'patched' + randomId() });
    });

  if (!nodes) {
    return <div>Loading</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Tree</h3>
      {nodes.map((n) => (
        <p key={n.name}>
          {n.name}
          <button style={{ marginLeft: 8 }} onClick={() => patchSomething(n)}>
            patch
          </button>
          <button style={{ marginLeft: 4 }} onClick={() => remove(n)}>
            remove
          </button>
        </p>
      ))}
      <div>
        <button onClick={createSomething}>Create</button>
      </div>
      <div style={{ marginTop: 48 }}>
        <Link to="/craft">Craft</Link>
      </div>
    </div>
  );
});
