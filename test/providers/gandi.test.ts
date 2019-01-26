import {assert} from 'chai';
import {env} from "../support";
import {createProvider} from "../..";

describe.skip('gandi', function () {
  this.timeout(10000);

  let provider;

  before(() => {
    provider = createProvider('gandi', <string>(env['DNSM_DOMAIN']), {token: env['DNSM_GANDI_TOKEN']});
  });

  it('authenticate', async () => {
    const answer = await provider.authenticate();
    console.log(answer);
  });

  it('create', async () => {
    const answer = await provider.create({name: 't1', type: 'A', content: '1.1.1.2'});
    console.log(answer);
  });

  it('list', async () => {
    const answer = await provider.list({name: 'www'});
    console.log(answer);
  });

  it('update', async () => {
    const answer = await provider.update({name: 'test', type: 'A', content: '2.2.2.2'});
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

