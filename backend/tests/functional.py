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

class AuthenticationTest(unittest.TestCase):
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
        print r.json()
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

if __name__ == '__main__':
    unittest.main()
