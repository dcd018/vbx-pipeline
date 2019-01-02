import _ from 'lodash';
import request from 'request-promise';
import * as cfg from './config';
import * as providers from './providers';

export default async function pipeline(req) {
  const provider = Object.values(providers).find(x => {
    const name = x && typeof x === 'function' && x.name.toLowerCase();
    const { headers } = name && cfg.providers[name];
    return name && x.validateHeaders(req, headers) && x;
  });
  req.pipeline = provider && new provider(req);
  const { endpoint, mutations: { createMessage: query } } = cfg.graphql;
  const variables = await req.pipeline.export();
  return request({ 
    ...endpoint.req, 
    uri: endpoint.getUri(), 
    body: { 
      query, 
      variables
    }
  });
}