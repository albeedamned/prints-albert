const app = require('../app');
// const { assert, expect } = require('chai');
const request = require('supertest');

describe('/api/solids', () => {
  describe('POST', () => {
    it('returns new solid', async () => {
      await request(app)
      .post('/api/solids')
      .send({
        "id": "25",
        "name": "sharp",
        "material": "cheddar",
        "density": "69"
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        "id": "25",
        "name": "sharp",
        "material": "cheddar",
        "density": "69"
      });
    });
    it('returns 400 with incomplete solid object', async () => {
      await request(app)
      .post("/api/solids")
      .send({})
      .expect(400);
    });
  });

  describe('GET', () => {
    it('returns json for all solids', async () => {
      await request(app)
      .get('/api/solids')
      .expect('Content-Type', /json/)
      .expect(200);      
    });
    it('returns single solid with query string', async () => {
      await request(app)
      .get('/api/solids/25')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, [{
        "id": "25",
        "name": "sharp",
        "material": "cheddar",
        "density": "69"
      }]);      
    });
  });

  describe('DELETE', () => {
    it('returns deleted solid', async () => {
      await request(app)
      .delete('/api/solids/25')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, [{
        "id": "25",
        "name": "sharp",
        "material": "cheddar",
        "density": "69"
      }]);
    });
  });
});

describe('/api/printjobs', () => {
  describe('POST', () => {
    it('returns new printjob', async () => {
      await request(app)
      .post('/api/printjobs')
      .send({
        "id": "1",
        "solidId": "25",
        "name": "sharp",
        "material": "cheddar",
        "density": "69"
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        "id": "25",
        "print_time": "69",
        "solid_id": "1",
        "solid_material": "cheddar",
        "solid_name": "sharp"
      });
    });
    it('returns 400 with incomplete solid object', async () => {
      await request(app)
      .post("/api/solids")
      .send({})
      .expect(400);
    });
  });

  describe('GET', () => {
    it('returns json for all printjobs', async () => {
      await request(app)
      .get('/api/printjobs')
      .expect('Content-Type', /json/)
      .expect(200);      
    });    
  });

  describe('DELETE', () => {
    it('returns deleted solid', async () => {
      await request(app)
      .delete('/api/printjobs/25')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, [{
        "id": "25",
        "print_time": "69",
        "solid_id": "1",
        "solid_material": "cheddar",
        "solid_name": "sharp"
      }]);
    });
  });
});