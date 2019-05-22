import { call, put, select, take, cancel } from 'redux-saga/effects';
import { Action, ActionCreator } from './actionCreatorFactory';

export type Handler<InS extends OutS, OutS, P> = (state: InS, payload: P) => OutS;

interface Model<T> {
  namespace: string;
  state?: T;
  reducers?: any;
  effects?: any;
  subscriptions?: any;
}

export interface EffectsCommandMap {
  put: typeof put;
  call: typeof call;
  select: typeof select;
  take: typeof take;
  cancel: typeof cancel;
}

export type EffectsHandler<P> = (action: Action<P>, effects: EffectsCommandMap) => void;

export class DvaModelBuilder<InS extends OutS, OutS = InS> {
  private model: Model<OutS>;

  constructor(initState: InS, namespace?: string) {
    this.model = {
      state: initState,
      namespace,
      effects: {},
      reducers: {},
    };
  }

  case = <P>(actionCreator: ActionCreator<P>, handler: Handler<InS, OutS, P>) => {
    this.model.reducers[actionCreator.originType] = handler;
    return this;
  };

  takeEvery = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>) => {
    this.model.effects[actionCreator.originType] = handler;
    return this;
  };

  build = () => {
    return this.model;
  };
}
