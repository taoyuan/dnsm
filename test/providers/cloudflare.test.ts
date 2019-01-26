import {assert} from 'chai';
import {env} from "../support";
import {createProvider} from "../..";

describe.skip('cloudflare', function () {
  this.timeout(10000);

  let provider;

  before(() => {
    provider = createProvider('cloudflare', <string>(env['DNSM_DOMAIN']), {
      user: env['DNSM_CLOUDFLARE_USER'],
      token: env['DNSM_CLOUDFLARE_TOKEN']
    });
  });

  describe('authenticate', () => {
    it('authenticate', async () => {
      const answer = await provider.authenticate();
      console.log(answer);
    });
  });


  describe('basic operations', () => {
    before(async () => provider.authenticate());

    it('create', async () => {
      const answer = await provider.create({name: 't1', type: 'A', content: '1.1.1.2'});
      console.log(answer);
    });

    it('list', async () => {
      const answer = await provider.list({name: 't1'});
      assert.lengthOf(answer, 1);
      console.log(answer);
    });

    it('list with unknown name', async () => {
      const answer = await provider.list({name: 'not_exist_name'});
      assert.lengthOf(answer, 0);
      console.log(answer);
    });

    it('update', async () => {
      const answer = await provider.update({name: 't1', type: 'A', content: '2.2.2.2'});
      console.log(answer);
    });

    it('update root domain', async () => {
      const answer = await provider.update({type: 'A', ttl: 120, content: '2.2.2.2'});
      console.log(answer);
    });

    it('delete', async () => {
      const answer = await provider.delete({name: 't1'});
      console.log(answer);
    });

    it('updyn', async () => {
      const answer = await provider.updyn({name: 'test', content: '3.3.3.3'});
      console.log(answer);
    });
  });


});

