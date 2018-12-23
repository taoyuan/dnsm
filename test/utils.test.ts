import {assert} from "chai";
import psl = require('psl');
import {aggregate} from "..";

describe('utils', () => {
  it('aggregate', () => {
    const answer = aggregate([
      'www.example.com',
      'test.example.com',
      'www.test.com',
      'blog.test.com',
      'home.io'
    ], (domain) => psl.get(domain));
    const expected = {
      'example.com': ['www.example.com', 'test.example.com'],
      'test.com': ['www.test.com', 'blog.test.com'],
      'home.io': ['home.io']
    };
    assert.deepEqual(answer, expected);
  });
});
