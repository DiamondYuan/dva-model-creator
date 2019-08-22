import { call, put, select, take, cancel, all, race } from 'redux-saga/effects';
import { Action, ActionCreator, PollActionCreator } from './actionCreatorFactory';
import * as warning from 'warning';
import { History } from 'history';
import { Dispatch } from 'redux';

export * from './actionCreatorFactory';

export interface SubscriptionAPI {
  history: History;
  dispatch: Dispatch<any>;
}

export type Subscription = (api: SubscriptionAPI, done: Function) => void;

export interface SubscriptionsMapObject {
  [key: string]: Subscription;
}

export type Handler<InS extends OutS, OutS, P> = (state: InS, payload: P) => OutS;

export type ImmerHandler<InS, P> = (state: InS, payload: P) => void;

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
  all: typeof all;
  race: typeof race;
}

export type EffectsHandler<P> = (payload: P, effects: EffectsCommandMap) => IterableIterator<any>;

export type EffectsHandlerWithAction<P> = (
  payload: Action<P>,
  effects: EffectsCommandMap
) => IterableIterator<any>;

export type EffectsWatcher = (effects: EffectsCommandMap) => IterableIterator<any>;

export class DvaModelBuilder<InS extends OutS, OutS = InS> {
  private model: Model<OutS>;

  constructor(initState: InS, namespace?: string) {
    this.model = {
      state: initState,
      namespace,
      effects: {},
      reducers: {},
      subscriptions: {},
    };
  }

  immer = <P>(actionCreator: ActionCreator<P>, handler: ImmerHandler<InS, P>) => {
    this.checkType(actionCreator.type);
    this.model.reducers[actionCreator.originType] = (state, action) =>
      handler(state, action.payload);
    return this;
  };

  immerWithAction = <P>(actionCreator: ActionCreator<P>, handler: ImmerHandler<InS, Action<P>>) => {
    this.checkType(actionCreator.type);
    this.model.reducers[actionCreator.originType] = handler;
    return this;
  };

  case = <P>(actionCreator: ActionCreator<P>, handler: Handler<InS, OutS, P>) => {
    this.checkType(actionCreator.type);
    this.model.reducers[actionCreator.originType] = (state, action) =>
      handler(state, action.payload);
    return this;
  };

  caseWithAction = <P>(actionCreator: ActionCreator<P>, handler: Handler<InS, OutS, Action<P>>) => {
    this.checkType(actionCreator.type);
    this.model.reducers[actionCreator.originType] = handler;
    return this;
  };

  takeEvery = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>) => {
    return this.setEffects(actionCreator, function*({ payload }, effects) {
      return yield handler(payload, effects);
    });
  };

  takeEveryWithAction = <P>(
    actionCreator: ActionCreator<P>,
    handler: EffectsHandlerWithAction<P>
  ) => {
    return this.setEffects(actionCreator, handler);
  };

  takeLatest = <P>(actionCreator: ActionCreator<P>, handler: EffectsHandler<P>) => {
    return this.setEffects(actionCreator, [
      function*({ payload }, effects) {
        return yield handler(payload, effects);
      },
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
      function*({ payload }, effects) {
        return yield handler(payload, effects);
      },
      { type: 'throttle', ms },
    ]);
  };

  throttleWithAction = <P>(
    actionCreator: ActionCreator<P>,
    handler: EffectsHandlerWithAction<P>,
    ms?: number
  ) => {
    return this.setEffects(actionCreator, [handler, { type: 'throttle', ms }]);
  };

  watcher = <P>(actionCreator: ActionCreator<P>, handler: EffectsWatcher) => {
    return this.setEffects(actionCreator, [handler, { type: 'watcher' }]);
  };

  poll = <P>(
    pollActionCreator: PollActionCreator<P>,
    handler: EffectsHandler<P>,
    delay: number
  ) => {
    return this.setEffectsWithPollActionCreator(pollActionCreator, [
      function*({ payload }, effects) {
        return yield handler(payload, effects);
      },
      { type: 'poll', delay },
    ]);
  };

  subscript = (func: Subscription) => {
    let funcName = func.name;

    warning(!!funcName, `some subscriptions in model ${this.model.namespace} don't have name`);
    warning(!this.model.subscriptions[funcName], `duplicate  subscript function name ${funcName}`);

    this.model.subscriptions[funcName] = func;
    return this;
  };

  build = () => {
    return this.model;
  };

  private setEffects = <P>(actionCreator: ActionCreator<P>, data: any) => {
    this.checkType(actionCreator.type);
    this.model.effects[actionCreator.originType] = data;
    return this;
  };

  private setEffectsWithPollActionCreator = <P>(
    pollActionCreator: PollActionCreator<P>,
    data: any
  ) => {
    this.checkType(pollActionCreator.type);
    this.model.effects[pollActionCreator.originType] = data;
    return this;
  };

  private checkType(type: string) {
    const { namespace } = this.model;
    if (namespace) {
      const action = type.split('/');
      warning(action.length === 2, `action ${type} in model "${namespace}" should have namespace`);
      if (action.length === 2) {
        warning(
          action[0] === namespace,
          `action "${type}" can't be effects or reducers in model "${namespace}"`
        );
      }
    }
  }
}
