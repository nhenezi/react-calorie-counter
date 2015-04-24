import fixtures
import models
import unittest
import requests
import simplejson
import time

base_url = 'http://localhost:3005/'

class RegistrationTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def test_duplicate_email(self):
        data = {
            'email': 'user1@lc.com',
            'password': 'test'
        }
        r = requests.post(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_missing_email(self):
        data = {
            'password': 'test'
        }
        r = requests.post(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_missing_password(self):
        data = {
            'password': 'test'
        }
        r = requests.post(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_successful_registration(self):
        data = {
            'email': 'user3@lc.com',
            'password': 'test'
        }
        r = requests.post(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertTrue(r.json()['success'])
        self.assertTrue('user' in r.json())
        self.assertTrue(r.json()['user']['email'] == 'user3@lc.com')

class LoginTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def test_missing_password(self):
        data = {
            'email': 'user1@lc.com',
        }
        r = requests.post(
            base_url + 'auth',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_missing_email(self):
        data = {
            'password': 'test'
        }
        r = requests.post(
            base_url + 'auth',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_invalid_password(self):
        data = {
            'email': 'user1@lc.com',
            'password': 'invalid'
        }
        r = requests.post(
            base_url + 'auth',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_invalid_email(self):
        data = {
            'email': 'userc.com',
            'password': 'test'
        }
        r = requests.post(
            base_url + 'auth',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_successful_login(self):
        data = {
            'email': 'user1@lc.com',
            'password': 'test'
        }
        r = requests.post(
            base_url + 'auth',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertTrue(r.json()['success'])
        self.assertTrue('user' in r.json())
        self.assertTrue(r.json()['user']['email'] == 'user1@lc.com')

class GetAuthTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def test_invalid_access_token(self):
        data = {
            'access_token': 'nvalid',
        }
        r = requests.get(
            base_url + 'auth',
            params=data,
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_missing_access_token(self):
        data = {
        }
        r = requests.get(
            base_url + 'auth',
            params=data,
        )

        self.assertTrue(r.status_code == 404)

    def test_successful_access_token(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.get(
            base_url + 'auth',
            params=data,
        )

        self.assertTrue('success' in r.json())
        self.assertTrue(r.json()['success'])
        self.assertTrue('user' in r.json())
        self.assertTrue(r.json()['user']['email'] == 'user1@lc.com')


if __name__ == '__main__':
    unittest.main()
