import { DvaModelBuilder } from './../src/index';
import actionCreatorFactory from '../src/actionCreatorFactory';
import { equal } from 'assert';

interface InitState {
  name: string;
  list: string[];
}

const state: InitState = {
  name: '',
  list: [],
};

const actionCreator = actionCreatorFactory('name');

const model = new DvaModelBuilder(state, 'name')
  .case(actionCreator<{ name: string }>('load_name'), (state, payload) => {
    return {
      ...state,
      name: payload.name,
    };
  })
  .takeEvery(actionCreator<{ url: string }>('fetchData'), function*({ payload: { url } }, { put }) {
    console.log(url);
    yield put({
      type: '!',
    });
  })
  .build();

describe('test DvaModelBuilder', () => {
  it('should get correct namespace', () => {
    equal(model.namespace, 'name');
  });
});
