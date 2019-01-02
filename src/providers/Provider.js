import _ from 'lodash';
import { IncomingMessage } from 'http';
import { parse, stringify } from 'querystring';
import * as cfg from '../config';

export default class Provider {

  static getConfig(provider) {
    return provider && cfg.providers[provider];
  }

  static validateHeaders(req, headers = {}) {
    let keys = req && req.headers && Object.keys(req.headers);
    const { auth = [], required = [] } = headers;
    if (keys && required.length) keys = keys.filter(key => 
      required.includes(key.toLowerCase())
    );
    const included = (keys && _.zipObject(
      keys.map(key => key.toLowerCase()), 
      keys.map(key => req.headers[key])
    )) || {};
    const missing = _.difference(Object.keys(included), required);
    const pass = _.isEqual(auth, _.pick(included, Object.keys(auth)));
    return !missing.length && pass && included;
  }
  
  constructor(req, provider) {
    if ((req instanceof IncomingMessage) === false) throw new TypeError(
      `Expected "req" to be and instance of "http.IncomingMessage", got "${typeof req}"`
    );
    if (!cfg.providers[provider]) throw new Error(
      'Unable to determine provider config for http.IncomingMessage.'
    );
    this.req = req;
    this.provider = provider;
    this.headers = this.config.headers;
    this.req.uri = this.parseRequestUri();
    this.req.body = this.parseBody();
  }

  get config() {
    return Provider.getConfig(this.provider);
  }

  set headers(headers) {
    headers = Provider.validateHeaders(this.req, headers);
    if (!headers) throw new Error(
      'Missing or invalid headers detected.'
    );
    this._headers = headers;
    return this;
  }

  get headers() {
    return this._headers;
  }

  parseRequestUri() {
    const { protocol: proto, headers: { host }, url, query: q } = this.req;
    if (!proto || !host || !url) throw new Error(
      'Unable to resolve request URI of http.IncomingMessage.'
    );
    const qs = q && Object.keys(q).length && stringify(q);
    return `${proto}://${host}/api${url}${qs || ''}`;
  }

  parseBody() {
    const { req: { body }, headers } = this; 
    if (body && _.isObject(body)) {
      return body;
    }
    const fn = {
      'application/x-www-form-urlencoded': parse,
      'application/json': JSON.parse
    }
    const type = headers && headers['content-type'];
    return type && fn[type] && fn[type].apply(this, [ body ]);
  }

  async export() {
    const { body } = this.req;
    const { schemaMap } = this.config;
    body.provider = this.provider;
    return (function assign(x, res = {}) {
      Object.keys(x).forEach(key => 
        res[key] = (_.isObject(x[key])) ? assign(x[key]) : body && body[x[key]]
      );
      return res;
    })(schemaMap);
  }
}