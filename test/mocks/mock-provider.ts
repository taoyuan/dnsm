import {BaseProvider, RecordData, RecordFilter, RecordParams, Record} from "../..";
import {Logger} from "../../src/logger";
import {ProviderOptions} from "../../src";

export type MockProviderRequest = [string, any?]

export class MockProvider extends BaseProvider {

  requests: any[] = [];

  constructor(domain: string, opts: ProviderOptions, logger?: Logger) {
    super(domain, opts, logger);
  }

  async authenticate(): Promise<any> {
    this.requests.push(['authenticate']);
  }

  async create(params: RecordData): Promise<void> {
    this.requests.push(['create', params]);
  }

  async list(filter?: RecordFilter): Promise<Record[]> {
    this.requests.push(['list', filter]);
    return [];
  }

  async update(identifier: string, params?: RecordParams): Promise<void> {
    this.requests.push(['update', [identifier, params]]);
  }

  async delete(identifier: string, params?: RecordFilter): Promise<void> {
    this.requests.push(['delete', [identifier, params]]);
  }

  async updyn(identifier: string, params: RecordParams): Promise<void> {
    this.requests.push(['updyn', [identifier, params]]);
  }
}
