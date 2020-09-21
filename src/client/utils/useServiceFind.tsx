import { useEffect, useMemo, useRef, useState } from 'react';
import { Node } from '../../treenity/tree/node';
import client from '../feathers';
import produce from 'immer';
import { applyPatch, types, unprotect as _unprotect } from 'mobx-state-tree';


const unprotect = mst => (_unprotect(mst),mst);

export function useServiceFind(name, query) {
  const q = JSON.stringify(query);
  const nodes = useMemo(() => unprotect(types.array(Node).create()), [name, q]);
  const subIdRef = useRef<string|null>(null);

  useEffect(() => {
    const service = client.service(name);

    const created = (obj) => {
      nodes.push(obj);
      console.log('created', obj);
    };
    const removed = (id) => {
      console.log('removed', id);
      const idx = nodes.findIndex(d => d._id === id);
      if (idx >= 0) {
        nodes.splice(idx, 1);
      }
    };

    const patched = (arg) => {
      try {
        if (!arg) return;
        const { id, patch, ...rest } = arg;

        console.log('patched', id, patch, rest);

        const idx = nodes.findIndex(d => d._id === id);
        applyPatch(nodes[idx], patch);
      } catch (err) {
        console.error(err);
      }
    };
    service.on('created', created);
    service.on('patched', patched);
    service.on('removed', removed);

    service.find({ query: { ...query, subscribe: true } }).then(({ data, subId }) => {
      nodes.push(...data);
    });

    return () => {
      service.removeListener('created', created);
      service.removeListener('patched', patched);
      service.removeListener('removed', removed);
      service.find({ query: { subscribe: false, subId: subIdRef.current } });
    };
  }, [name, q]);

  return nodes;
}
