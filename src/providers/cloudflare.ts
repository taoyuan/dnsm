import assert = require("assert");
import axios from 'axios';
import _ = require('lodash');
import {BaseProvider, ProviderOptions, Record, RecordData, RecordFilter, RecordParams} from "../provider";

import {Logger} from "../logger";
import {CommandOption} from "../prog";
import {RequestError} from "../errors";

interface CloudflareRequest {
  type: string;
  name: string;
  content: string;
  ttl?: number;
}

export = class CloudflareProvider extends BaseProvider {
  static cliopts: CommandOption[] = [{
    synopsis: '-T, --token',
    description: 'Specify the cloudflare api key to authenticate'
  }];

  readonly name: string = 'cloudflare';
  protected api;

  constructor(domain: string, opts: ProviderOptions, logger?: Logger) {
    super(domain, opts, logger);

    assert(opts.user, 'user is required');
    assert(opts.token, 'token is required');

    this.api = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Email': opts.user,
        'X-Auth-Key': opts.token
      }
    });
  }

  protected async _authenticate(): Promise<any> {
    let data;
    try {
      const res = await this.api.get('zones', {params: {name: this.domain, status: 'active'}});
      this.logger.debug('[cloudflare] ==> authenticated:', res);
      data = res.data;
    } catch (e) {
      raiseRequestError(e);
    }

    if (!data.result) {
      throw new Error('No domain found');
    }

    if (data.result.length > 1) {
      throw new Error('Too many domains found. This should not happen');
    }

    this._domainId = _.get(data, 'result[0].id');
    return this._domainId;
  }

  protected async _create(params: RecordData): Promise<any> {
    if (!this.domainId) {
      throw new Error('authenticate is required');
    }
    const data: CloudflareRequest = {
      type: params.type,
      name: this.full(params.name || this.domain),
      content: params.content
    };
    if (this.opts.ttl) {
      data.ttl = this.opts.ttl;
    }

    let result = {success: true};

    try {
      const res = await this.api.post(`/zones/${this.domainId}/dns_records`, data);
      result = res.data;
    } catch (e) {
      if (_.find(_.get(e, 'response.data.errors'), err => err.code === 81057)) {
        this.logger.debug('[cloudflare] ==> create record: record exists, unchanged');
      } else {
        raiseRequestError(e);
      }
    }

    this.logger.debug('[cloudflare] ==> create record:', result);

    return result.success;
  }

  // @ts-ignore
  protected async _list(filter?: RecordFilter): Promise<Record[]> {
    if (!this.domainId) {
      throw new Error('authenticate is required');
    }

    const listFilter: any = {per_page: 100, ...filter};
    if (listFilter.name) {
      listFilter.name = this.full(listFilter.name);
    }

    try {
      const {data} = await this.api.get(`/zones/${this.domainId}/dns_records`, {params: listFilter});
      const answer: Record[] = _.map(data.result, item => _.pick(item, ['id', 'name', 'type', 'ttl', 'content']));
      this.logger.debug('[cloudflare] ==> list records:', answer);
      return answer;
    } catch (e) {
      raiseRequestError(e);
    }
  }

  protected async _update(identifier: string, params: RecordParams): Promise<any> {
    if (!this.domainId) {
      throw new Error('authenticate is required');
    }

    const paramsToUse = {...params};
    paramsToUse.name = this.full(paramsToUse.name || this.domain);

    const filter = _.pick(paramsToUse, ['name', 'type']);

    if (!identifier) {
      const records = await this.list(filter);
      if (!_.isEmpty(records)) {
        if (records.length > 1) {
          throw new Error('There are more than one record found with filter: ' + JSON.stringify(filter));
        }
        identifier = records[0].id;
      }
    }

    if (identifier) {
      const data: any = {per_page: 100, ...paramsToUse};

      try {
        const res = await this.api.put(`/zones/${this.domainId}/dns_records/${identifier}`, data);
        this.logger.debug('[cloudflare]  ==> updated record:', res.data.success);
        return res.data.success;
      } catch (e) {
        raiseRequestError(e);
      }
    } else if (paramsToUse.name && paramsToUse.type && paramsToUse.content) {
      return this._create(<RecordData>paramsToUse);
    } else {
      throw new Error('Can not find DNS record with filter: ' + JSON.stringify(filter));
    }
  }

  protected async _delete(identifier: string, params?: RecordFilter): Promise<any> {
    if (!this.domainId) {
      throw new Error('authenticate is required');
    }

    const ids: string[] = [];

    if (identifier) {
      ids.push(identifier);
    } else {
      const filter = _.pick(params, ['name', 'type']);
      const records = await this.list(filter);
      ids.push(...records.map(item => item.id));
    }

    this.logger.debug('[cloudflare]  ==> delete record:', ids);

    try {
      if (!_.isEmpty(ids)) for (const id of ids) {
        await this.api.delete(`/zones/${this.domainId}/dns_records/${id}`);
      }
      return true;
    } catch (e) {
      raiseRequestError(e);
    }
  }
}

function raiseRequestError(e: Error) {
  throw new RequestError(_.get(e, 'response.data.message') || e.message, _.get(e, 'response.data'));
}
