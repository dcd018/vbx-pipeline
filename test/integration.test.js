import _ from 'lodash';
import pipeline from '../src/index';
import { IncomingMessage } from 'http';
import { post } from './mock';

jest.setTimeout(30000);

test('POST /sms', async () => {
  const req = _.mergeWith(new IncomingMessage(), post);
  const res = await pipeline(req);
  console.log(res);
  console.log(req.pipeline);
});