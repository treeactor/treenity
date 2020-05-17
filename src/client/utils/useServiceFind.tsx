import { useEffect, useRef, useState } from 'react';
import { Node } from '../../treenity/tree/node';
import client from '../feathers';
import produce, { applyPatches } from 'immer';

export function useServiceFind(name, query) {
  const [data, _setData] = useState<Node[]>([]);
  const subIdRef = useRef<string|null>(null);
  const dataRef = useRef<Node[]>(data);
  const setData = d => {
    dataRef.current = d;
    _setData(d);
  };

  useEffect(() => {
    const service = client.service(name);

    const created = (obj) => {
      console.log('created', obj);
      setData(produce(dataRef.current, draft => {
        draft.push(obj);
      }));
    };
    const removed = (id) => {
      console.log('removed', id);
      setData(produce(dataRef.current, draft => {
        const idx = draft.findIndex(d => d._id === id);
        if (idx >= 0) {
          draft.splice(idx, 1);
        }
      }));
    };

    const patched = (arg) => {
      try {
        if (!arg) return;
        const { id, patch, ...rest } = arg;

        console.log('patched', id, patch, rest);

        setData(produce(dataRef.current, draft => {
          const idx = draft.findIndex(d => d._id === id);
          if (idx >= 0) {
            draft[idx] = applyPatches(dataRef.current[idx], patch);
          }
        }));
      } catch (err) {
        console.error(err);
      }
    };
    service.on('created', created);
    service.on('patched', patched);
    service.on('removed', removed);

    service.find({ query: { ...query, subscribe: true } }).then(({ objects, subId }) => {
      setData(objects);
      subIdRef.current = subId;
    });

    return () => {
      service.removeListener('created', created);
      service.removeListener('patched', patched);
      service.removeListener('removed', removed);
      service.find({ query: { subscribe: false, subId: subIdRef.current } });
    };
  }, [name]);

  return data;
}
