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

const fetchName = actionCreator<{ id: string }>('fetchName');
const setName = actionCreator<{ name: string }>('setName');

const model = new DvaModelBuilder(state, 'name')
  .takeEvery(fetchName, function*({ payload: { id } }, { put }) {
    yield put(setName({ name: `${id}1` }));
  })
  .case(setName, (state, payload) => {
    return {
      ...state,
      name: payload.name,
    };
  })
  .build();

describe('test DvaModelBuilder', () => {
  it('should get correct namespace', () => {
    equal(model.namespace, 'name');
  });
});
