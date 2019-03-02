import {assert} from "chai";
import {Iper} from "../src";

describe('iper', () => {
  it('should retrieve external ip address', async () => {
    const address = await Iper.retrieve();
    assert.ok(address);
  })
});
