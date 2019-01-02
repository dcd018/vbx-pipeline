import twilio from 'twilio';
import Provider from './Provider';

export default class Twilio extends Provider {

  constructor(req) { 
    super(req, 'twilio');
  }

  get client() {
    const { accountSid, authToken } = this.config.credentials;
    return accountSid && authToken && twilio(accountSid, authToken);
  }

  get signature() {
    const { 'x-twilio-signature': signature } = this.headers;
    const { SmsMessageSid, MessageSid } = this.req.body;
    const sid = SmsMessageSid || MessageSid;
    if (!signature || !sid) throw new Error(
      'Unable to validate message signature.'
    );
    return { sid, signature };
  }

  get media() {
    const { schemaMap: { media: schema } } = this.config;
    const [ cnt, url ] = schema && Object.keys(schema)
      .map(key => Object.keys(this.req.body)
      .filter(x => x.indexOf(schema[key]) > -1)
      .sort().map(x => this.req.body[x])
    );
    return cnt && url && cnt.map((contentType, i) => 
      ({ url: url[i], contentType })
    );
  }

  async validate() {
    const { credentials: { authToken } } = this.config;
    const { sid, signature } = this.signature;
    const { errorCode } = await this.client.messages(sid).fetch();
    const isValid = twilio.validateRequest(
      authToken,
      signature, 
      this.req.uri,
      this.req.body
    );
    if (errorCode || !isValid) throw new Error(
      'Unable to verify the request is valid.'
    );
    return true
  }

  async export() {
    const media = this.media;
    const schema = await this.validate() && await super.export();
    return (media) ? { ...schema, media } : schema;
  }
}