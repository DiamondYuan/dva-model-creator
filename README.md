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

配合 Umi Pro 食用更佳 [`umijs/vscode-extension-umi-pro`](https://github.com/umijs/vscode-extension-umi-pro)。

### 优点

- 为所有 action 定义类型
- 测试覆盖率 100%，可以放心使用。
- 100% 兼容现有 dva 项目，可以和原有的 dva/umi 项目混合使用。

### how to use

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

### immer

immer 需要在 dva 或者 umi 中开启 immer. immer 和 case 无法同时使用。

```typescript
import { DvaModelBuilder, actionCreatorFactory } from 'dva-model-creator';

const actionCreator = actionCreatorFactory('namespace');
const add = actionCreator<number>('add');
const minus = actionCreator<number>('minus');

interface Counter {
  number: number;
}

const model = new DvaModelBuilder<Counter>({ number: 0 })
  .immer(add, (state, payload) => {
    state.number += payload;
  })
  .immerWithAction(minus, (state, action) => {
    state.number -= action.payload;
  })
  .build();

export default model;
```

## 招聘

食亨团队始于 2017 年，总部位于上海，目前员工近 800 人。服务超过 300 个国内知名餐饮连锁品牌，近万家门店，覆盖 85 个城市。是国内领先的规模化、系统化运营的餐饮外卖运营公司。得到中国顶尖资本助力，获得了来自红杉资本中国及高榕资本领投的过亿元融资。

招聘前端小伙伴。

邮箱 `fandi.yuan@shihengtech.com`
