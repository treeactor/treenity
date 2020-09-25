import {
  addMiddleware,
  getSnapshot,
  IAnyStateTreeNode,
  IAnyType,
  IDisposer,
  ISerializedActionCall,
  isStateTreeNode,
  joinJsonPath,
  splitJsonPath,
} from 'mobx-state-tree';

/***
 * This functions mostly copied from mobx-state-tree
 */

function serializeTheUnserializable(baseType) {
  return {
    $MST_UNSERIALIZABLE: true,
    type: baseType,
  };
}

function isPlainObject(value: any): value is { [k: string]: any } {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * @internal
 * @hidden
 */
function isPrimitive(value: any, includeDate = true): boolean {
  if (value === null || value === undefined) return true;
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (includeDate && value instanceof Date)
  ) {
    return true;
  }
  return false;
}

function serializeArgument(node: IAnyType, actionName: string, index: number, arg: any): any {
  if (arg instanceof Date) return { $MST_DATE: arg.getTime() };
  if (isPrimitive(arg)) return arg;
  // We should not serialize MST nodes, even if we can, because we don't know if the receiving party can handle a raw snapshot instead of an
  // MST type instance. So if one wants to serialize a MST node that was pass in, either explitly pass: 1: an id, 2: a (relative) path, 3: a snapshot
  if (isStateTreeNode(arg)) return getSnapshot(arg); //serializeTheUnserializable(`[MSTNode: ${getType(arg).name}]`)
  if (typeof arg === 'function') return serializeTheUnserializable(`[function]`);
  if (typeof arg === 'object' && !isPlainObject(arg) && !Array.isArray(arg)) {
    return serializeTheUnserializable(
      `[object ${(arg && (arg as any).constructor && (arg as any).constructor.name) || 'Complex Object'}]`
    );
  }
  try {
    // Check if serializable, cycle free etc...
    // MWE: there must be a better way....
    JSON.stringify(arg); // or throws
    return arg;
  } catch (e) {
    return serializeTheUnserializable('' + e);
  }
}

function getStateTreeNode(value: IAnyStateTreeNode): any {
  if (!isStateTreeNode(value)) {
    // istanbul ignore next
    throw fail(`Value ${value} is no MST Node`);
  }
  // @ts-ignore
  return value.$treenode!;
}

const doubleDot = (_: any) => '..';

function getRelativePathBetweenNodes(base: any, target: any): string {
  // PRE condition target is (a child of) base!
  if (base.root !== target.root) {
    throw fail(
      `Cannot calculate relative path: objects '${base}' and '${target}' are not part of the same object tree`
    );
  }

  const baseParts = splitJsonPath(base.path);
  const targetParts = splitJsonPath(target.path);
  let common = 0;
  for (; common < baseParts.length; common++) {
    if (baseParts[common] !== targetParts[common]) break;
  }
  // TODO: assert that no targetParts paths are "..", "." or ""!
  return baseParts.slice(common).map(doubleDot).join('/') + joinJsonPath(targetParts.slice(common));
}

/**
 * Registers a function that will be invoked for each action that is called on the provided model instance, or to any of its children.
 * See [actions](https://github.com/mobxjs/mobx-state-tree#actions) for more details. onAction events are emitted only for the outermost called action in the stack.
 * Action can also be intercepted by middleware using addMiddleware to change the function call before it will be run.
 *
 * Not all action arguments might be serializable. For unserializable arguments, a struct like `{ $MST_UNSERIALIZABLE: true, type: "someType" }` will be generated.
 * MST Nodes are considered non-serializable as well (they could be serialized as there snapshot, but it is uncertain whether an replaying party will be able to handle such a non-instantiated snapshot).
 * Rather, when using `onAction` middleware, one should consider in passing arguments which are 1: an id, 2: a (relative) path, or 3: a snapshot. Instead of a real MST node.
 *
 * Example:
 * ```ts
 * const Todo = types.model({
 *   task: types.string
 * })
 *
 * const TodoStore = types.model({
 *   todos: types.array(Todo)
 * }).actions(self => ({
 *   add(todo) {
 *     self.todos.push(todo);
 *   }
 * }))
 *
 * const s = TodoStore.create({ todos: [] })
 *
 * let disposer = onAction(s, (call) => {
 *   console.log(call);
 * })
 *
 * s.add({ task: "Grab a coffee" })
 * // Logs: { name: "add", path: "", args: [{ task: "Grab a coffee" }] }
 * ```
 *
 * @param target
 * @param listener
 * @param attachAfter (default false) fires the listener *after* the action has executed instead of before.
 * @returns
 */
export function onAction(target: IAnyStateTreeNode, listener: (call: ISerializedActionCall) => void): IDisposer {
  return addMiddleware(target, function handler(rawCall, next) {
    if (rawCall.type === 'action' && !rawCall.name.startsWith('$') /* && rawCall.id === rawCall.rootId*/) {
      const sourceNode = getStateTreeNode(rawCall.context);
      const info = {
        name: rawCall.name,
        path: getRelativePathBetweenNodes(getStateTreeNode(target), sourceNode),
        args: rawCall.args.map((arg: any, index: number) => serializeArgument(sourceNode, rawCall.name, index, arg)),
      };
      listener(info);
      return next(rawCall);
    } else {
      return next(rawCall);
    }
  });
}
