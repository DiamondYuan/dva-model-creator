<h1 align="center">Dva Model Creator</h1>
<p align="center">
    <a href="https://travis-ci.org/DiamondYuan/dva-model-creator">
      <img src="https://img.shields.io/travis/DiamondYuan/dva-model-creator/master.svg?style=flat-square" alt="Build Status">
    </a>
    <a href="https://codecov.io/gh/DiamondYuan/dva-model-creator">
      <img src="https://img.shields.io/codecov/c/github/DiamondYuan/dva-model-creator/master.svg?style=flat-square" alt="Codecov">
    </a>
</p>

write type string dva model

### how to use

```
const actionCreator = actionCreatorFactory('namespace');
const add = actionCreator<number>('add');
const minus = actionCreator<number>('minus');
const asyncAdd = actionCreator<number>('asyncAdd');
const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

interface Counter {
  number: number;
}

const model = new DvaModelBuilder<Counter>({ number: 0 })
  .case(add, (state, payload) => {
    return {
      number: state.number + payload,
    };
  })
  .case(minus, (state, payload) => {
    return {
      number: state.number - payload,
    };
  })
  .takeEvery(asyncAdd, function*(payload, { call, put }) {
    yield call(delay, 100);
    yield put(add(payload));
  })
  .build();

export default model;
```
