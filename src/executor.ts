import _ = require('lodash');
import PromiseA = require("bluebird");
import psl = require('psl');
import {Logger} from "logs";
import arrify = require("arrify");
import {Provider, ProviderOptions, Record, RecordData, RecordFilter, createProvider} from "./provider";
import {Iper} from "./iper";
import {aggregate, authFromEnv} from "./utils";
import {Config} from "./config";

const iper = new Iper();

export type ExecutorOptions = ProviderOptions & ExecuteParams;

export interface ExecuteParams {
  type?: string;
  identifier?: string;
  name?: string;
  ttl?: number;
  content?: any;
}

export class Executor {
  protected _provider: Provider;
  protected _ready: Promise<void>;

  constructor(provider: Provider, logger?: Logger) {
    this._provider = provider;
    this._ready = provider.authenticate();
  }

  // for test
  static createProvider(provider: string, domain: string, opts: ProviderOptions, logger?: Logger): Provider {
    opts = _.defaults({...opts}, authFromEnv(provider));
    return createProvider(provider, psl.get(domain), opts, logger);
  }

  static async execute(provider: string, action: string, domains: string | string[], opts: ExecutorOptions, logger?: Logger) {
    const {name, type, ttl, content} = opts;

    domains = Array.isArray(domains) ? domains : [domains];
    const aggregated = aggregate(domains, domain => psl.get(domain));
    const names = Object.keys(aggregated);

    const answer = {};
    for (const domain of names) {
      const p = this.createProvider(provider, domain, opts, logger);
      const executor = Executor.create(p, logger);
      const items = aggregated[domain].map(full => ({name: name || full, type, ttl, content}));
      answer[domain] = await executor.execute(action, items.length > 1 ? items : items[0]);
    }
    return names.length > 1 ? answer : answer[names[0]];
  }

  static create(provider: Provider, logger?: Logger): Executor;

  static create(provider: string, domain: string, options: ProviderOptions, logger?: Logger): Executor;

  static create(provider: string | Provider, domain?: string | Logger, options?: ProviderOptions, logger?: Logger): Executor {
    if (typeof provider === 'string') {
      return new this(this.createProvider(provider, <string>domain, <ProviderOptions>options, logger), logger);
    }
    return new this(provider, <Logger>domain);
  }

  async execute(action: string, params: ExecuteParams | ExecuteParams[]) {
    await this._ready;
    switch (action) {
      case 'create':
        return await this.create(params);
      case 'list':
        return await this.list(params);
      case 'update':
        return await this.update(params);
      case 'delete':
        return await this.delete(params);
      case 'updyn':
        return await this.updyn(params);
      default:
        throw new Error('unsupported action: ' + action);
    }
  }

  async create(params: ExecuteParams | ExecuteParams[]): Promise<void> {
    await this._ready;
    if (!Array.isArray(params)) {
      return await this._provider.create(<RecordData>params);
    }
    params.forEach(async item => await this._provider.create(<RecordData>item));
  }

  async list(params: ExecuteParams | ExecuteParams[]): Promise<Record[] | Record[][]> {
    await this._ready;
    if (!Array.isArray(params)) {
      return await this._provider.list(<RecordFilter>params);
    }
    const answer: Record[][] = [];
    for (const item of params) {
      answer.push(await this._provider.list(<RecordFilter>item));
    }
    return answer;
  }

  async update(params: ExecuteParams | ExecuteParams[]): Promise<void> {
    await this._ready;
    for (const item of arrify(params)) {
      await this._provider.update(item.identifier || '', item);
    }
  }

  async delete(params: ExecuteParams): Promise<number>;
  async delete(params: ExecuteParams[]): Promise<number[]>;
  async delete(params: ExecuteParams | ExecuteParams[]): Promise<number | number[]>;
  async delete(params: ExecuteParams | ExecuteParams[]): Promise<number | number[]> {
    await this._ready;
    if (Array.isArray(params)) {
      return PromiseA.map(params, item => this._provider.delete(item.identifier || '', item));
    } else {
      return await this._provider.delete(params.identifier || '', params);
    }
  }

  async updyn(items: ExecuteParams[] | string[] | ExecuteParams | string) {
    await this._ready;
    const itemsToUse = Array.isArray(items) ? items : arrify(items);
    // normalize and resolve items
    let resolved: ExecuteParams[] = [];
    // @ts-ignore
    for (const item of itemsToUse) {
      let i: ExecuteParams;
      if (typeof item === 'string') {
        i = {name: item, content: ''};
      } else {
        i = item;
      }
      if (!i.content) {
        i.content = await iper.retrieve();
      }
      resolved.push(i);
    }

    for (const item of resolved) {
      await this._provider.updyn(item.identifier || '', item);
    }
  }

}

export interface ExecuteWithProviderOptions extends ExecutorOptions {
  provider: string;
  domains: string | string[];
}

export interface ExecuteWithConfOptions extends ExecutorOptions {
  conf: string;
}

export interface ExecuteWithEntriesOptions extends ExecutorOptions {
  entries: { [provider: string]: string | string[] };
}

export async function execute(action: string, opts: ExecuteWithProviderOptions | ExecuteWithConfOptions | ExecuteWithEntriesOptions, logger?: Logger) {
  if ((<any>opts).provider) {
    opts = <ExecuteWithProviderOptions>opts;
    logger && logger.debug(`execute with provider ${opts.provider}`);
    await executeWithProvider(action, opts, logger);
  } else if ((<any>opts).conf) {
    opts = <ExecuteWithConfOptions>opts;
    logger && logger.debug(`execute with config "${opts.conf}"`);
    await executeWithConfig(action, opts, logger);
  } else if ((<any>opts).entries) {
    opts = <ExecuteWithEntriesOptions>opts;
    logger && logger.debug('execute with entries:', opts.entries);
    await executeWithEntries(action, opts, logger);
  } else {
    throw new Error('no provider or config file provided');
  }
}

async function executeWithProvider(action: string, opts: ExecuteWithProviderOptions, logger?: Logger) {
  const {provider, domains} = opts;
  if (!domains || !domains.length) {
    throw new Error('no domains provided')
  }

  await Executor.execute(provider, action, domains, opts, logger);
}

async function executeWithConfig(action: string, opts: ExecuteWithConfOptions, logger?: Logger) {
  const {conf} = opts;
  const entries = Config.load(conf);
  if (!_.isPlainObject(entries)) {
    throw new Error(`config content in "${conf}" should be a plain object.`);
  }


  await executeWithEntries(action, {entries, ...opts}, logger);
}

async function executeWithEntries(action: string, opts: ExecuteWithEntriesOptions, logger?: Logger) {
  const {entries} = opts;
  const providers = Object.keys(entries);
  for (const provider of providers) if (entries[provider]) {
    await Executor.execute(provider, action, entries[provider], opts, logger);
  }
}


