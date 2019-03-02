import _ = require('lodash');
import {Logger} from "logs";
import os = require('os');
import fs = require("fs");
import path = require("path");
import glob = require("glob");
import Yaml = require('js-yaml');
import {Provider, ProviderOptions} from "../src";

export const env = process.env;

export function buildProviderCreator<T extends Provider>(ProviderClasses, cache?: T[]) {
  return (provider: string, domain: string, opts: ProviderOptions, logger?: Logger): Provider => {
    const p = new ProviderClasses[provider](domain, opts, logger);
    cache && cache.push(p);
    return p;
  }
}

export function loadSecretsToEnv(dir?: string) {
  dir = dir || os.homedir + '/.secrets/namex-test';
  const files = glob.sync(`${dir}/*.+(yml|yaml)`);
  for (const file of files) {
    let name = path.basename(file);
    name = name.substr(0, name.lastIndexOf('.'));
    const data = fs.readFileSync(file).toString('utf-8');
    const content = Yaml.safeLoad(data);
    _.forEach(content, (value, key) => {
      env[`DNS_${name.toUpperCase()}_${key.toUpperCase()}`] = value;
    })
  }
}

loadSecretsToEnv();
