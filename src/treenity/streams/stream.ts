import { applyPatches } from 'immer';

type DataType = 'a' | 'c' | 'r' | 'x';

interface StreamData {
  t: DataType; // type
  id: string;
  v: any; // value
  p?: string; // path to change
  f?: boolean; // final
}

class Stream {
  value: any[] = [];
  ids: object = {};
  _first?: any;

  push(data: StreamData) {
    switch (data.t) {
      case 'a': // add
        this.ids[data.id] = data.v;
        if (!this._first) this._first = data.id;
        return;

      case 'c': // change
        this.ids[data.id] = applyPatches(this.ids[data.id], data.v);
        return;

      case 'r': // remove
        delete this.ids[data.id];
        if (this._first === data.id) {
          this._first = Object.keys(this.ids)[0];
        }
        return;

      case 'x': // reset
        this.ids = {};
        this._first = undefined;
        return;
      default:
    }
  }

  first(): any {
    return this.ids[this._first];
  }
}
