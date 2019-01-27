import {Provider, ProviderOptions, Logger} from "../src";

export const env = process.env;

export function buildProviderCreator<T extends Provider>(ProviderClasses, cache?: T[]) {
  return (provider: string, domain: string, opts: ProviderOptions, logger?: Logger): Provider => {
    const p = new ProviderClasses[provider](domain, opts, logger);
    cache && cache.push(p);
    return p;
  }
}
