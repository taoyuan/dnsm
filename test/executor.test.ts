import {assert} from "chai";
import * as sinon from "sinon";
import * as s from "./support";
import {execute, registerProvider, Executor} from "../src";
import {MockProvider} from "./mocks/mock-provider";

describe('executor', () => {
  before(() => {
    registerProvider('mock', MockProvider);
    stubCreateProvider = sinon.stub(Executor, 'createProvider');
  });

  after(() => {
    stubCreateProvider.reset();
    stubCreateProvider = null;
  });

  let cache: MockProvider[];
  let stubCreateProvider;

  beforeEach(() => {
    stubCreateProvider.callsFake(s.buildProviderCreator<MockProvider>(MockProvider, cache = []));
  });

  describe('#createWithProvider', () => {
    it('should create single name for one full domain', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['create', {
          name: 'n1.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]
      ];
      await execute('create', {provider: 'mock', domains: 'n1.example.com', content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });

    it('should create single name for one relative domain', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['create', {
          name: 'n1',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]
      ];
      await execute('create', {provider: 'mock', domains: 'example.com', name: 'n1', content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });
  });

  describe('#createWithEntries', () => {
    it('should create with entries', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['create', {
          name: 'n1.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }],
        ['create', {
          name: 'n2.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]
      ];
      const entries = {
        mock: ['n1.example.com', 'n2.example.com']
      };
      await execute('create', {entries, content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });
  });

  describe.only('#updyn', () => {
    it('should update with entries', async () => {
      const expectedRequests = [
        ['authenticate'],
        ['updyn', ['', {
          name: 'n1.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]],
        ['updyn', ['', {
          name: 'n2.example.com',
          type: undefined,
          ttl: undefined,
          content: '1.1.1.1'
        }]]
      ];
      const entries = {
        mock: ['n1.example.com', 'n2.example.com']
      };
      await execute('updyn', {entries, content: "1.1.1.1"});
      assert.lengthOf(cache, 1);
      assert.deepEqual(cache[0].domain, 'example.com');
      assert.deepEqual(cache[0].requests, expectedRequests);
    });
  });
});
