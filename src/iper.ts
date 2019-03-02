import _ = require('lodash');
import exip = require("external-ip");
import {promisify} from "util";

const DEFAULT_SERVICES = ["http://ifconfig.io/ip", "http://me.gandi.net", "https://api.ipify.org"];

export interface IperOptions {
  replace?: boolean;
  services?: string[];
  timeout?: number;
  mode?: "parallel" | "sequential";
  ua?: string;
  ttl?: number;
}

export class Iper {
  protected ttl: number;
  protected address: string;
  protected timestamp: number;
  protected fetchip: () => Promise<string>;

  static create(opts?: IperOptions) {
    return new Iper(opts);
  }

  static async retrieve(opts?: IperOptions) {
    return await this.create(opts).retrieve();
  }

  constructor(opts?: IperOptions) {
    opts = opts || {};
    this.ttl = opts.ttl || 60;

    this.fetchip = promisify(exip(_.defaults({
      replace: opts.replace,
      services: opts.services,
      timeout: opts.timeout,
      getIP: opts.mode,
      userAgent: opts.ua
    }, {
      replace: true,
      services: DEFAULT_SERVICES,
      timeout: 1000,
      getIP: "parallel",
      userAgent: "Chrome 71.0.3578 / Mac OS X 10.14.2"
    })));
  }

  async retrieve() {
    if (this.address && (Date.now() - this.timestamp) < this.ttl) {
      return this.address;
    }
    this.address = await this.fetchip();
    this.timestamp = Date.now();
    return this.address;
  }
}
