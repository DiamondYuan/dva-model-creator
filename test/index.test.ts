import { DvaModelBuilder } from './../src/index';
import actionCreatorFactory from '../src/actionCreatorFactory';
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

    it('handler args should correct ', async () => {
      const app = create();
      app.model(model);
      app.start();
      (app as any)._store.dispatch(addWatcher(2));
      (app as any)._store.dispatch(addWatcher(3));
      await delay(300);
      equal(app._store.getState()[namespace], 2);
    });
  });
});
