import {assert} from 'chai';
import {env} from "../support";
import {createProvider} from "../..";

describe.only('cloudflare', function () {
  this.timeout(10000);

  let provider;

  before(() => {
    provider = createProvider('cloudflare', <string>(env['DNS_DOMAIN']), {
      user: env['DNS_CLOUDFLARE_USER'],
      token: env['DNS_CLOUDFLARE_TOKEN']
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
      const answer = await provider.create({name: '_test', type: 'A', content: '1.1.1.2'});
      console.log(answer);
    });

    it('list', async () => {
      await provider.create({name: '_list', type: 'A', content: '1.2.3.4'});
      let answer = await provider.list({name: '_list'});
      assert.lengthOf(answer, 1);
      answer = await provider.list({name: '_list', content: '1.2.3.4'});
      assert.lengthOf(answer, 1);
      answer = await provider.list({name: '_list', content: '1.1.1.1'});
      assert.lengthOf(answer, 0);
    });

    it('list with unknown name', async () => {
      const answer = await provider.list({name: 'not_exist_name'});
      assert.lengthOf(answer, 0);
      console.log(answer);
    });

    it('update', async () => {
      const answer = await provider.update({name: '_test', type: 'A', content: '2.2.2.2'});
      console.log(answer);
    });

    it('update root domain', async () => {
      const answer = await provider.update({type: 'A', ttl: 120, content: '2.2.2.2'});
      console.log(answer);
    });

    it('delete', async () => {
      const answer = await provider.delete({name: '_test'});
      console.log(answer);
    });

    it('updyn', async () => {
      const answer = await provider.updyn({name: '_updyn', content: '3.3.3.3'});
      console.log(answer);
    });
  });


});

