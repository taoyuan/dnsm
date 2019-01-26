import {registerProvider} from "../provider";

registerProvider('gandi', require('./gandi'));
registerProvider('cloudflare', require('./cloudflare'));
