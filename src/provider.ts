import * as assert from "assert";
import _ = require('lodash');
import {Logger} from "logs";
import * as logs from "logs";
import psl = require('psl');
import {NotImplementedError, UnknownProvider} from "./errors";
import {rstrip} from "./utils";
import {CommandOption} from "./prog";

export interface RecordFilter {
  name?: string;
  type?: string;
  content?: any;
}

export interface RecordData {
  name: string;
  type: string;
  content: any;
  ttl?: number;
}

export interface RecordParams {
  name?: string;
  type?: string;
  ttl?: number;
  content?: any;
}

export interface ProviderBaseOptions {
  ttl?: number;
}

export interface ProviderAuthOptions {
  user?: string;
  pass?: string;
  token?: string;
  secret?: string;
}

export interface ProviderOptions extends ProviderBaseOptions, ProviderAuthOptions {

}

export interface Record {
  id: string;
  type: string;
  name: string;
  ttl: number;
  content: any;
}

const DEFAULTS = {
  ttl: 3600
};


export interface Provider {
  readonly name: string;

  readonly logger: Logger;

  authenticate(): Promise<any>;

  create(params: RecordData): Promise<void>;

  list(filter?: RecordFilter): Promise<Record[]>;

  update(params: RecordParams): Promise<void>;

  update(identifier: string, params: RecordParams): Promise<void>;

  delete(params: RecordFilter): Promise<number>;

  delete(identifier: string): Promise<number>;

  delete(identifier: string, params?: RecordFilter): Promise<number>;

  updyn(params: RecordParams): Promise<void>;

  updyn(identifier: string, params: RecordParams): Promise<void>;
}

export class AbstractProvider implements Provider {
  readonly name: string;

  readonly logger: Logger;

  protected _domain: string;
  protected _domainId?: string;

  protected _opts: ProviderOptions;

  get domain() {
    return this._domain;
  }

  get domainId() {
    return this._domainId;
  }

  get opts() {
    return this._opts;
  }

  constructor(name: string, domain: string, opts: ProviderOptions, logger?: Logger) {
    assert(name, '`name` is required');
    assert(domain, '`domain` is required');
    this.name = name;
    // @ts-ignore
    this._domain = psl.get(domain.toLowerCase());
    this._opts = _.defaults({...opts}, DEFAULTS);
    this.logger = logger ? logger.extend(this.name) : logs.get(`namex:${this.name}`);
  }

  protected async _authenticate(): Promise<any> {
    throw new NotImplementedError();
  }

  protected async _create(params: RecordData): Promise<void> {
    throw new NotImplementedError();
  }

  protected async _list(filter?: RecordFilter): Promise<Record[]> {
    throw new NotImplementedError();
  }

  protected async _update(identifier: string, params: RecordParams): Promise<void> {
    throw new NotImplementedError();
  }

  protected async _delete(identifier: string, params?: RecordFilter): Promise<number> {
    throw new NotImplementedError();
  }

  async authenticate(): Promise<any> {
    return this._authenticate();
  }

  async create(params: RecordData): Promise<void> {
    return this._create(params);
  }

  async list(filter?: RecordFilter): Promise<Record[]> {
    return this._list(filter);
  }

  async update(params: RecordParams): Promise<void>;
  async update(identifier: string, params: RecordParams): Promise<void>;
  async update(identifier: string | RecordParams, params?: RecordParams): Promise<void> {
    if (typeof identifier === 'string') {
      return this._update(identifier, <RecordParams>params);
    } else {
      return this._update('', <RecordParams>identifier);
    }
  }

  async delete(params: RecordFilter): Promise<number>;
  async delete(identifier: string): Promise<number>;
  async delete(identifier: string | RecordFilter, params?: RecordFilter): Promise<number> {
    if (typeof identifier === 'string') {
      return this._delete(identifier, params);
    } else {
      return this._delete('', identifier);
    }

  }

  async updyn(params: RecordParams): Promise<void>;
  async updyn(identifier: string, params: RecordParams): Promise<void>;
  async updyn(identifier: string | RecordParams, params?: RecordParams): Promise<void> {
    if (typeof identifier !== 'string') {
      params = identifier;
      identifier = '';
    }
    params = params || {};
    params.type = params.type || 'A';
    params.ttl = params.ttl || 300;
    return await this.update(identifier, params);
  }

  protected fqdn(name: string): string {
    return this.full(name);
  }

  protected full(name: string): string {
    name = rstrip(name, '.');
    if (!name.endsWith(this.domain)) {
      return `${name}.${this.domain}`;
    }
    return name;
  }

  protected relative(name: string | any): string {
    if (name == null) {
      return '';
    }
    name = rstrip(name, '.');
    if (name.endsWith(this.domain)) {
      return rstrip(name.substr(0, name.length - this.domain.length), '.');
    }
    return name;
  }
}

export interface ProviderConstructor {
  readonly cliopts?: CommandOption[];

  new(domain: string, opts: ProviderOptions, logger?: Logger): Provider;
}

export const providers: { [name: string]: ProviderConstructor } = {};

export function registerProvider(name: string, ctor: ProviderConstructor) {
  providers[name] = ctor;
}

export function findProvider(name): ProviderConstructor | undefined {
  return providers[name];
}

export function createProvider(provider: string, domain: string, opts: ProviderOptions, logger?: Logger): Provider {
  const ProviderClass = findProvider(provider);
  if (ProviderClass) {
    return new ProviderClass(domain, opts, logger);
  }
  throw new UnknownProvider(provider);
}
