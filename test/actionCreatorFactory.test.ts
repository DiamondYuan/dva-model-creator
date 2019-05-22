import actionCreatorFactory from '../src/actionCreatorFactory';
import { equal } from 'assert';

describe('test actionCreatorFactory', () => {
  describe('', () => {
    const actionCreator = actionCreatorFactory('namespace');
    const fetchData = actionCreator<{ url: string }>('fetchData');

    it('type should have namespace', () => {
      equal(fetchData.type, 'namespace/fetchData');
    });

    it('originType should not have namespace ', () => {
      equal(fetchData.originType, 'fetchData');
    });
  });
});
