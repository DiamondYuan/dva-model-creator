<h1 align="center">Dva Model Creator</h1>
<p align="center">
    <a href="https://travis-ci.com/DiamondYuan/dva-model-creator">
      <img src="https://travis-ci.com/DiamondYuan/dva-model-creator.svg?branch=master" alt="Build Status">
    </a>
    <a href="https://codecov.io/gh/DiamondYuan/dva-model-creator">
      <img src="https://img.shields.io/codecov/c/github/DiamondYuan/dva-model-creator/master.svg?style=flat-square" alt="Codecov">
    </a>
    <a href="https://npmjs.org/package/dva-model-creator">
      <img src="https://img.shields.io/npm/v/dva-model-creator.svg?style=flat-square" alt="NPM version">
    </a>
</p>

> Inspired by [`aikoven/typescript-fsa`](https://github.com/aikoven/typescript-fsa) and [`dphilipson/typescript-fsa-reducers`](https://github.com/dphilipson/typescript-fsa-reducers)

Write type strong dva model

配合 Umi Pro 食用更佳 [`umijs/vscode-extension-umi-pro`][https://github.com/umijs/vscode-extension-umi-pro]。

### how to use

```bash
yarn add dva-model-creator
```

```typescript
import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';

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
