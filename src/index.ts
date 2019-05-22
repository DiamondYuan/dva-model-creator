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

export type EffectsHandler<P> = (payload: P, effects: EffectsCommandMap) => void;

export type EffectsHandlerWithAction<P> = (payload: Action<P>, effects: EffectsCommandMap) => void;

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
    this.model.reducers[actionCreator.originType] = (state, action) =>
      handler(state, action.payload);
    return this;
  };

  caseWithAction = <P>(actionCreator: ActionCreator<P>, handler: Handler<InS, OutS, Action<P>>) => {
    this.model.reducers[actionCreator.originType] = handler;
    return this;
  };

  takeEvery = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>) => {
    return this.setEffects(actionCreator, ({ payload }, effects) => handler(payload, effects));
  };

  takeEveryWithAction = <P>(
    actionCreator: ActionCreator<P>,
    handler: EffectsHandlerWithAction<P>
  ) => {
    return this.setEffects(actionCreator, handler);
  };

  takeLatest = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>) => {
    return this.setEffects(actionCreator, [
      ({ payload }, effects) => handler(payload, effects),
      { type: 'takeLatest' },
    ]);
  };

  takeLatestWithAction = <P>(
    actionCreator: ActionCreator<P>,
    handler: EffectsHandlerWithAction<P>
  ) => {
    return this.setEffects(actionCreator, [handler, { type: 'takeLatest' }]);
  };

  throttle = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>, ms?: number) => {
    return this.setEffects(actionCreator, [
      ({ payload }, effects) => handler(payload, effects),
      { type: 'throttle', ms },
    ]);
  };

  throttleWithAction = <P>(
    actionCreator: ActionCreator<P>,
    handler: EffectsHandlerWithAction<P>
  ) => {
    return this.setEffects(actionCreator, [handler, { type: 'takeLatest' }]);
  };

  watcher = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>) => {
    return this.setEffects(actionCreator, [
      ({ payload }, effects) => handler(payload, effects),
      { type: 'watcher' },
    ]);
  };

  watcherWithAction = <P>(
    actionCreator: ActionCreator<P>,
    handler: EffectsHandlerWithAction<P>
  ) => {
    return this.setEffects(actionCreator, [handler, { type: 'watcher' }]);
  };

  private setEffects = <P>(actionCreator: ActionCreator<P>, data: any) => {
    this.model.effects[actionCreator.originType] = data;
    return this;
  };

  build = () => {
    return this.model;
  };
}
