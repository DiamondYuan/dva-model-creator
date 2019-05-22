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

  it('test takeLatest and takeEveryWithAction', () => {
    const actionCreator = actionCreatorFactory('takeLatestTest');
    const action1 = actionCreator<string>('action1');
    const action2 = actionCreator<string>('action2');
    let callback = sinon.fake();
    const model = new DvaModelBuilder(state, 'takeLatestTest')
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

    ['action1', 'action2'].forEach(name => {
      equal(Array.isArray(model.effects[name]), true);
      equal(model.effects[name].length, 2);
      deepEqual(model.effects[name][1], { type: 'takeLatest' });
    });

    let data = getRandomString();
    dispatchOnce(model, action1(data));
    equal(callback.callCount, 1);
    equal(callback.calledWith(data), true);

    data = getRandomString();
    dispatchOnce(model, action2(data));
    equal(callback.callCount, 2);
    deepEqual(callback.getCall(1).args[0], { type: 'takeLatestTest/action2', payload: data });
  });

  describe('test takeEvery and takeEveryWithAction', () => {
    const actionCreator = actionCreatorFactory('takeEveryAction');
    const action1 = actionCreator<string>('action1');
    const action2 = actionCreator<string>('action2');
    let callback = sinon.fake();
    const model = new DvaModelBuilder(state, 'takeEveryAction')
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

    it('should effects action is not array ', () => {
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
      deepEqual({ type, payload }, { type: 'takeEveryAction/action2', payload: data });
    });
  });
});
