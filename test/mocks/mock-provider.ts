import {Logger} from "logs";
import {AbstractProvider, RecordData, RecordFilter, RecordParams, Record, ProviderOptions} from "../../src";

export class MockProvider extends AbstractProvider {

  requests: any[] = [];

  constructor(domain: string, opts: ProviderOptions, logger?: Logger) {
    super('mock', domain, opts, logger);
  }

  protected async _authenticate(): Promise<any> {
    this.requests.push(['authenticate']);
  }

  protected async _create(params: RecordData): Promise<void> {
    this.requests.push(['create', params]);
  }

  protected async _list(filter?: RecordFilter): Promise<Record[]> {
    this.requests.push(['list', filter]);
    return [];
  }

  protected async _update(identifier: string, params: RecordParams): Promise<void> {
    this.requests.push(['update', [identifier, params]]);
  }

  protected async _delete(identifier: string, params?: RecordFilter): Promise<number> {
    this.requests.push(['delete', [identifier, params]]);
    return 0;
  }

}
