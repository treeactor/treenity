import { IAnyType, IJsonPatch, ISerializedActionCall, recordPatches } from 'mobx-state-tree';
import { onAction } from './record-actions';

export function getActions(mst: IAnyType, updater): readonly ISerializedActionCall[] {
  const actions: ISerializedActionCall[] = [];
  const dispose = onAction(mst, (action) => actions.push(action));
  updater(mst);
  dispose();

  return actions;
}

export function getPatches(mst, updater): readonly IJsonPatch[] {
  const recorder = recordPatches(mst);
  updater(mst);
  recorder.stop();

  return recorder.patches;
}

export function untrack(fn: Function): Function {
  fn.isUntracked = true;
  return fn;
}
