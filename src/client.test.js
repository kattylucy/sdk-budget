import { expect } from 'chai';
import nock from 'nock';
import { HttpClient } from './client.js'; 

describe('HttpClient', () => {
  const baseUrl = 'https://api.test';
  const apiKey  = 'test-key';
  let client;

  before(() => {
    client = new HttpClient({ baseUrl, apiKey });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should GET JSON with query params', async () => {
    nock(baseUrl, {
      reqheaders: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
      .get('/foo')
      .query({ bar: 'baz' })
      .reply(200, { success: true });

    const result = await client.request('/foo', { params: { bar: 'baz' } });
    expect(result).to.deep.equal({ success: true });
  });

  it('should POST JSON body and return parsed JSON', async () => {
    const payload = { name: 'Alice' };
    nock(baseUrl)
      .post('/users', payload)
      .reply(201, { id: 'u1', name: 'Alice' });

    const result = await client.request('/users', { method: 'POST', body: payload });
    expect(result).to.deep.equal({ id: 'u1', name: 'Alice' });
  });

  it('should return null on 204 No Content', async () => {
    nock(baseUrl).delete('/items/123').reply(204);

    const result = await client.request('/items/123', { method: 'DELETE' });
    expect(result).to.be.null;
  });

  it('should throw an Error on non-2xx status', async () => {
    nock(baseUrl)
      .get('/unauthorized')
      .reply(401, 'Unauthorized');

    try {
      await client.request('/unauthorized');
      throw new Error('Expected request to throw');
    } catch (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal('HTTP 401: Unauthorized');
    }
  });
});
