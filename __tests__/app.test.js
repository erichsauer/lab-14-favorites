require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('adds new plant to faves & verifies that it is there', async() => {

      const plant = {
        id: 2,
        common_name: 'neat plant',
        scientific_name: 'pantus neatus',
        year: 1994,
        family_common_name: 'neat',
        image_url: 'http://placekitten.com/300',
        genus: 'plantus',
        family: 'flora'
      };

      const expectation = [
        {
          _id: 4,
          id: 2,
          common_name: 'neat plant',
          scientific_name: 'pantus neatus',
          year: 1994,
          family_common_name: 'neat',
          image_url: 'http://placekitten.com/300',
          genus: 'plantus',
          family: 'flora',
          user_id: 2
        }
      ];

      await fakeRequest(app)
        .post('/api/faves')
        .set('Authorization', token)
        .send(plant);
        
      const data = await fakeRequest(app)
        .get('/api/faves')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    
    test('fetches a particular plant from faves', async() => {

      const expectation = {
        _id: 4,
        id: 2,
        common_name: 'neat plant',
        scientific_name: 'pantus neatus',
        year: 1994,
        family_common_name: 'neat',
        image_url: 'http://placekitten.com/300',
        genus: 'plantus',
        family: 'flora',
        user_id: 2
      };

      const data = await fakeRequest(app)
        .get('/api/faves/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('updates a particular plant in faves', async() => {

      const update = {
        id: 2,
        common_name: 'neat plant update',
        scientific_name: 'pantus neatus',
        year: 1994,
        family_common_name: 'neat',
        image_url: 'http://placekitten.com/300',
        genus: 'plantus',
        family: 'flora',
      };

      const expectation = {
        _id: 4,
        id: 2,
        common_name: 'neat plant update',
        scientific_name: 'pantus neatus',
        year: 1994,
        family_common_name: 'neat',
        image_url: 'http://placekitten.com/300',
        genus: 'plantus',
        family: 'flora',
        user_id: 2
      };

      await fakeRequest(app)
        .put('/api/faves/4')
        .set('Authorization', token)
        .send(update);

      const data = await fakeRequest(app)
        .get('/api/faves/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes a particular plant from faves', async() => {

      const expectation = '';

      const data = await fakeRequest(app)
        .delete('/api/faves/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
