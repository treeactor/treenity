import { Node } from '../treenity/tree/node';
import { IJsonPatch, ISerializedActionCall, onAction, onPatch } from 'mobx-state-tree';

export function getActions(mst: Node, updater): ISerializedActionCall[] {
  const actions = [];
  const dispose = onAction(mst, (action) => actions.push(action));
  updater(mst);
  dispose();

  return actions;
}

export function getPatches(mst, updater): IJsonPatch[] {
  const patches = [];
  const dispose = onPatch(mst, (patch) => patches.push(patch));
  updater(mst);
  dispose();

  return patches;
}
