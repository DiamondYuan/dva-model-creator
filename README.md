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

If develop JavaScript project,you can use [`umijs/vscode-extension-umi-pro`](https://github.com/umijs/vscode-extension-umi-pro)。

### Advantage

- Test coverage 100%, production available.
- Type strong action without any.
- 100% compatible with existing dva projects, can be mixed with the original dva/umi project.

### How to use

```bash
yarn add dva-model-creator
```

Config app.ts to prevent namespacePrefixWarning.

```javascript
export const dva = {
  config: {
    namespacePrefixWarning: false,
    onError(err: ErrorEvent) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};
```

```typescript
import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';

const actionCreator = actionCreatorFactory('namespace');
const add = actionCreator<number>('add');
const minus = actionCreator<number>('minus');
const asyncAdd = actionCreator<number>('asyncAdd');
const delay = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

interface Counter {
  number: number;
}

const model = new DvaModelBuilder<Counter>({ number: 0 }, 'namespace')
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
  .takeEvery(asyncAdd, function* (payload, { call, put }) {
    yield call(delay, 100);
    yield put(add(payload));
  })
  .build();

export default model;
```

### Immer

`immer` and `case` cannot be used at the same time, and you should open immer manually.

```typescript
import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';

const actionCreator = actionCreatorFactory('namespace');
const add = actionCreator<number>('add');
const minus = actionCreator<number>('minus');

interface Counter {
  number: number;
}

const model = new DvaModelBuilder<Counter>({ number: 0 }, 'namespace')
  .immer(add, (state, payload) => {
    state.number += payload;
  })
  .immerWithAction(minus, (state, action) => {
    state.number -= action.payload;
  })
  .build();

export default model;
```
