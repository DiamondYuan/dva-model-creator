import { test } from '../src/index';
import { equal } from 'assert';

describe('init test', () => {
  it('should get hello world', () => {
    equal(test(), 'hello world');
  });
});
