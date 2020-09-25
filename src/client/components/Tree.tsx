import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { clone, getSnapshot, Instance } from 'mobx-state-tree';

import client from '../feathers';
import { Node } from '../../treenity/tree/node';
import { useServiceFind } from '../utils/useServiceFind';
import { randomId } from '../../common/random-id';
import { getActions } from '../../mst/get-actions';
import { addType } from '../../treenity/registeredTypes';
import { meta } from '../../treenity/meta/meta.model';
import { TestMeta } from '../../mods/test/Test.meta';

function createSomething() {
  const node = Node.create({
    _p: 'root',
    _id: 'id' + randomId(),
    name: 'name' + randomId(),
    data: { some: 'test' },
  });

  client.service('tree').create(node);
}

function patch(node: Node, updater) {
  const actions = getActions(clone(node), updater);

  return client.service('tree').patch(node._id, actions);
}

function remove(node: Instance<typeof Node>) {
  return client.service('tree').remove(node._id);
}
function removeMeta(node: Node, meta: any) {
  patch(node, (node) => node.$removeMeta(meta._id));
}

export default observer(function Tree({}) {
  const nodes = useServiceFind('tree', {});

  const patchSomething = (n) =>
    patch(n, (n) => {
      n.$addMeta(TestMeta.create({ _id: randomId(), name: 'name' + randomId() }));
      // n.set({ name: 'patched' + randomId() });
    });

  if (!nodes) {
    return <div>Loading</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Tree</h3>
      {nodes.map((n) => (
        <div key={n.name}>
          <div>
            {n.name}
            <button style={{ marginLeft: 8 }} onClick={() => patchSomething(n)}>
              patch
            </button>
            <button style={{ marginLeft: 4 }} onClick={() => remove(n)}>
              remove
            </button>
          </div>
          <div>
            {n._m.map((m) => (
              <div key={m._id}>
                '{m._t}' '{m._id}' '{m.name}'{' '}
                <button style={{ marginLeft: 4 }} onClick={() => removeMeta(n, m)}>
                  -
                </button>
              </div>
            ))}
          </div>
        </div>
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
