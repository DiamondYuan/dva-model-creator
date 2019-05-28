/* eslint-disable max-nested-callbacks */
import { DvaModelBuilder, actionCreatorFactory } from './../src/index';
import { equal, deepEqual } from 'assert';
import * as sinon from 'sinon';
import { create } from 'dva-core';

interface InitState {
  name: string;
  list: string[];
}

const state: InitState = {
  name: '',
  list: [],
};

function dispatchOnce(model: any, action: any) {
  const app = create();
  app.model(model);
  app.start();
  (app as any)._store.dispatch(action);
}

function getRandomString() {
  return `DiamondYuanLoveOpLinJie${Math.random()
    .toString()
    .slice(-10)}`;
}

describe('test DvaModelBuilder', () => {
  it('should get correct namespace', () => {
    const namespace = getRandomString();
    const model = new DvaModelBuilder(state, namespace).build();
    equal(model.namespace, namespace);
  });

  describe('test case and caseWithAction', () => {
    const namespace = getRandomString();
    const actionCreator = actionCreatorFactory(namespace);
    const add = actionCreator<number>('add');
    const model = new DvaModelBuilder(0, namespace)
      .case(add, (state, payload) => {
        return state + payload;
      })
      .caseWithAction(actionCreator<number>('minus'), (state, { payload }) => {
        return state - payload;
      })
      .build();

    it('should get correct state', () => {
      const app = create();
      app.model(model);
      app.start();
      (app as any)._store.dispatch(add(100));
      equal(app._store.getState()[namespace], 100);
      (app as any)._store.dispatch({
        type: `${namespace}/minus`,
        payload: 1,
      });
      equal(app._store.getState()[namespace], 99);
      (app as any)._store.dispatch({
        type: `${namespace}/add`,
        payload: 30,
      });
      equal(app._store.getState()[namespace], 129);
    });
  });

  describe('test takeEvery and takeEveryWithAction', () => {
    const namespace = getRandomString();
    const actionCreator = actionCreatorFactory(namespace);
    const action1 = actionCreator<string>('action1');
    const action2 = actionCreator<string>('action2');
    let callback = sinon.fake();
    const model = new DvaModelBuilder(state, namespace)
      .takeEvery(action1, payload => {
        callback(payload);
      })
      .takeEveryWithAction(action2, ({ type, payload }) => {
        callback({
          type,
          payload,
        });
      })
      .build();

    it('should get correct effects type ', () => {
      ['action1', 'action2'].forEach(name => {
        equal(Array.isArray(model.effects[name]), false);
      });
    });

    it('should called with correct args', () => {
      let data = getRandomString();
      dispatchOnce(model, action1(data));
      equal(callback.callCount, 1);
      equal(callback.calledWith(data), true);

      data = getRandomString();
      dispatchOnce(model, action2(data));
      equal(callback.callCount, 2);
      const { type, payload } = callback.getCall(1).args[0];
      deepEqual({ type, payload }, { type: `${namespace}/action2`, payload: data });
    });
  });

  describe('test takeLatest and takeEveryWithAction', () => {
    const namespace = getRandomString();
    const actionCreator = actionCreatorFactory(namespace);
    const action1 = actionCreator<string>('action1');
    const action2 = actionCreator<string>('action2');
    let callback = sinon.fake();
    const model = new DvaModelBuilder(state, namespace)
      .takeLatest(action1, payload => {
        callback(payload);
      })
      .takeLatestWithAction(action2, ({ type, payload }) => {
        callback({
          type,
          payload,
        });
      })
      .build();

    it('should get correct effects type', () => {
      ['action1', 'action2'].forEach(name => {
        equal(Array.isArray(model.effects[name]), true);
        equal(model.effects[name].length, 2);
        deepEqual(model.effects[name][1], { type: 'takeLatest' });
      });
    });

    it('handler args should correct ', () => {
      let data = getRandomString();
      dispatchOnce(model, action1(data));
      equal(callback.callCount, 1);
      equal(callback.calledWith(data), true);

      data = getRandomString();
      dispatchOnce(model, action2(data));
      equal(callback.callCount, 2);
      deepEqual(callback.getCall(1).args[0], { type: `${namespace}/action2`, payload: data });
    });
  });

  describe('test throttle and throttleWithAction', () => {
    const namespace = getRandomString();
    const actionCreator = actionCreatorFactory(namespace);
    const action1 = actionCreator<string>('action1');
    const action2 = actionCreator<string>('action2');
    let callback = sinon.fake();
    const model = new DvaModelBuilder(state, namespace)
      .throttle(
        action1,
        payload => {
          callback(payload);
        },
        10
      )
      .throttleWithAction(
        action2,
        ({ type, payload }) => {
          callback({
            type,
            payload,
          });
        },
        10
      )
      .build();

    it('should get correct throttle time', () => {
      ['action1', 'action2'].forEach(name => {
        equal(Array.isArray(model.effects[name]), true);
        equal(model.effects[name].length, 2);
        deepEqual(model.effects[name][1], { type: 'throttle', ms: 10 });
      });
    });

    it('handler args should correct ', () => {
      let data = getRandomString();
      dispatchOnce(model, action1(data));
      equal(callback.callCount, 1);
      equal(callback.calledWith(data), true);

      data = getRandomString();
      dispatchOnce(model, action2(data));
      equal(callback.callCount, 2);
      deepEqual(callback.getCall(1).args[0], { type: `${namespace}/action2`, payload: data });
    });
  });

  describe('test watcher and watcherWithAction', async () => {
    const namespace = getRandomString();
    const actionCreator = actionCreatorFactory(namespace);
    const add = actionCreator<number>('add');
    const addWatcher = actionCreator<number>('addWatcher');
    const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));
    const model = new DvaModelBuilder(0, namespace)
      .case(add, (state, payload) => {
        return state + payload || 1;
      })
      .watcher(addWatcher, function*({ take, put, call }) {
        while (true) {
          const { payload } = yield take(addWatcher);
          yield call(delay, 100);
          yield put(add(payload));
        }
      })
      .build();

    it('should get correct state', async () => {
      const app = create();
      app.model(model);
      app.start();
      (app as any)._store.dispatch(addWatcher(2));
      (app as any)._store.dispatch(addWatcher(3));
      await delay(300);
      equal(app._store.getState()[namespace], 2);
    });
  });

  describe('test warn', () => {
    const namespace = 'test';
    it('should warn if use error action creator ', () => {
      let mockFn = (console.error = sinon.fake());
      const errorActionCreator = actionCreatorFactory('error');
      const model = new DvaModelBuilder(0, namespace);
      model.case(errorActionCreator('case'), state => state);
      deepEqual(mockFn.getCall(0).args, [
        `Warning: action "error/case" can't be effects or reducers in model "test"`,
      ]);
      model.caseWithAction(errorActionCreator('caseWithAction'), state => state);
      deepEqual(mockFn.getCall(1).args, [
        `Warning: action "error/caseWithAction" can't be effects or reducers in model "test"`,
      ]);
      let effects = [
        'takeEvery',
        'takeEveryWithAction',
        'takeLatest',
        'takeLatestWithAction',
        'throttle',
        'throttleWithAction',
        'watcher',
      ];
      for (let i = 0; i < effects.length; i++) {
        const effect = effects[i];
        model[effect](errorActionCreator(effect), function*() {
          yield console.log();
        });
        deepEqual(mockFn.getCall(i + 2).args, [
          `Warning: action "error/${effect}" can't be effects or reducers in model "test"`,
        ]);
      }
    });

    it('should warn if use noNamespaceActionCreator', () => {
      let mockFn = (console.error = sinon.fake());
      const noNamespaceActionCreator = actionCreatorFactory();
      const model = new DvaModelBuilder(0, namespace);
      model.case(noNamespaceActionCreator('case'), state => state);
      deepEqual(mockFn.getCall(0).args, [
        `Warning: action case in model "test" should have namespace`,
      ]);
      model.caseWithAction(noNamespaceActionCreator('caseWithAction'), state => state);
      deepEqual(mockFn.getCall(1).args, [
        `Warning: action caseWithAction in model "test" should have namespace`,
      ]);
      let effects = [
        'takeEvery',
        'takeEveryWithAction',
        'takeLatest',
        'takeLatestWithAction',
        'throttle',
        'throttleWithAction',
        'watcher',
      ];
      for (let i = 0; i < effects.length; i++) {
        const effect = effects[i];
        model[effect](noNamespaceActionCreator(effect), function*() {
          yield console.log();
        });
        deepEqual(mockFn.getCall(i + 2).args, [
          `Warning: action ${effect} in model "test" should have namespace`,
        ]);
      }
    });
  });
});
