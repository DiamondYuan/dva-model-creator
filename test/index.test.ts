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

const asyncFetchData = actionCreator.async<{ id: string }, { list: string[] }>('asyncFetchData');

const model = new DvaModelBuilder(state, 'name')
  .takeEvery(asyncFetchData.started, function*({ payload: { id } }, { put }) {
    console.log('load data by id', id);
    const result = ['1', '2'];
    yield put(
      asyncFetchData.done({
        params: { id },
        result: {
          list: result,
        },
      })
    );
  })
  .case(asyncFetchData.done, (state, payload) => {
    return {
      ...state,
      list: payload.result.list,
    };
  })
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
