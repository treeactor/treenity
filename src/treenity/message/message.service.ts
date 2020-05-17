import { Application, Id, NullableId, Params, Service, ServiceMethods } from '@feathersjs/feathers';
import { makeUpdateFromPatch } from '../model/make-patch-update';
import { useEffect } from 'react';
import Meta from '../meta/meta.model';
import { object } from '../model/types';
import { warn } from 'winston';
import EventEmitter from 'events';


export default class MessageService extends EventEmitter implements ServiceMethods<any> {
  // @ts-ignore
  private app: Application;

  async find(params: Params) {}

  async get(id: Id, params: Params) {
    if (params.connection) {
      this.app.channel(`${id}`).join(params.connection);
    }
  }

  async update(id: Id, data: any, params?: Params): Promise<any> {
    this.app.channel(`${id}`).send(data);
  }

  async patch(id: Id, data: any, params?: Params): Promise<any> {}

  async create(data: any, params: Params) {}

  async remove(id: Id, params: Params) {
    if (id && params.connection) {
      this.app.channel(`${id}`).leave(params.connection);
    }
  }

  setup(app: any, path: string) {
    this.app = app;
  }

  connect(meta: Meta, portName, onMsg) {
    const link = meta._l?.find(l => l.lp === portName);
    if (!link) {
      warn('msg-service', 'link not found', meta._id, portName);
      return;
    }

    const event = `${link.rm}/${link.rp}`;
    this.on(event, onMsg);

    // return unsubscriber
    return () => this.off(event, onMsg);
  }
}


// type Id = string;
//
// Подписки легкие через каналы.
// сделать хук, в котором принимать - отправлять пакеты
function useIn(meta: Meta, portName: string, options?: any) {
  const links = meta.node._l?.filter(l => l.lp === portName);
}


function useInArray<T>(meta: Meta, portName: string, ): [boolean, T[]] {
  useEffect(() => {

  });

  const loaded = false;
  const array = [{} as T];

  return [loaded, array];
}

function useOut(onConnect: Function, portName: string, options?: any): Function {
  const send = (msg: object) => {

  };

  return send;
}

function SomeFilterComponent({ value, onChange }) {
  const out = useOut(({ query }) => {
    out([]);
  }, 'out');
  useIn(value,'in', { query: {} })
    .pipe(map(data => data * 2)).subscribe(useOut('out'))
}
