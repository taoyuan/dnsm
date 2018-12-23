import {BaseProvider, createProvider, Provider, ProviderOptions} from "../src";
import {Logger} from "../src/logger";

export const env = process.env;

export function buildProviderCreator<T extends Provider>(ProviderClass, cache?: T[]) {
  return (provider: string, domain: string, opts: ProviderOptions, logger?: Logger): Provider => {
    const p = new ProviderClass(domain, opts, logger);
    cache && cache.push(p);
    return p;
  }
}
