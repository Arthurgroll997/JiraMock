const http = require('http');
const app = require('../src/api');

describe('Health endpoint', () => {
  let server;
  let port;

  beforeAll((done) => {
    server = app.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('GET /health returns 200', (done) => {
    http.get(`http://localhost:${port}/health`, (res) => {
      expect(res.statusCode).toBe(200);
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const body = JSON.parse(data);
        expect(body.status).toBe('ok');
        done();
      });
    });
  });
});
