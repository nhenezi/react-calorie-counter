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

class UpdateSettingsTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def test_missing_access_token(self):
        data = {
        }
        r = requests.put(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_invalid_access_token(self):
        data = {
            'access_token': 'asdf'
        }
        r = requests.put(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_invalid_email(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'email': 'fake_email',
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.put(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_email_change(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'email': 'new_mail@lc.com',
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.put(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertIn('success', r.json())
        self.assertTrue(r.json()['success'])
        self.assertIn('user', r.json())
        self.assertEqual('new_mail@lc.com', r.json()['user']['email'])

    def test_expected_calories_change(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'expected_calories': 400,
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.put(
            base_url + 'user',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertIn('success', r.json())
        self.assertTrue(r.json()['success'])
        self.assertIn('user', r.json())
        self.assertEqual(400, r.json()['user']['expected_calories'])

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

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

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

class GetMealTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def invalid_access_token(self):
        data = {
            'access_token': 'ffff',
        }
        r = requests.get(
            base_url + 'meal',
            params=data,
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_get_all(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.get(
            base_url + 'meal',
            params=data,
        )

        self.assertTrue(len(r.json()) > 0)
        self.assertIn('calories', r.json()[0])
        self.assertIn('id', r.json()[0])
        self.assertIn('name', r.json()[0])

    def test_get_one(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.get(
            base_url + 'meal/1/',
            params=data,
        )

        self.assertIn('calories', r.json())
        self.assertIn('id', r.json())
        self.assertIn('name', r.json())


class PostMealTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def test_invalid_access_token(self):
        data = {
            'access_token': 'ffff',
        }
        r = requests.get(
            base_url + 'meal',
            params=data,
        )

        self.assertTrue('success' in r.json())
        self.assertFalse(r.json()['success'])

    def test_missing_name_param(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'calories': 200,
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.post(
            base_url + 'meal',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertIn('success', r.json())
        self.assertFalse(r.json()['success'])

    def test_missing_calories_param(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'name': 'Orange',
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.post(
            base_url + 'meal',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertIn('success', r.json())
        self.assertFalse(r.json()['success'])

    def test_success_creation(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'name': 'Orange',
            'calories': 50,
            'access_token': user1.access_token,
        }
        session.close()
        r = requests.post(
            base_url + 'meal',
            data=simplejson.dumps(data),
            headers={'content-type': 'application/json'}
        )

        self.assertIn('calories', r.json())
        self.assertIn('id', r.json())
        self.assertIn('name', r.json())

        self.assertEqual(r.json()['name'], 'Orange')
        self.assertEqual(r.json()['calories'], 50)
        self.assertTrue(r.json()['id'])

class DeleteMealTest(unittest.TestCase):
    def setUp(self):
        fixtures.reload()

    def test_invalid_access_token(self):
        data = {
            'access_token': 'ffff',
        }
        r = requests.delete(
            base_url + 'meal/1/',
            params=data,
        )

        self.assertIn('success', r.json())
        self.assertFalse(r.json()['success'])

    def test_invalid_meal_id(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'access_token': user1.access_token,
        }
        session.close()

        r = requests.delete(
            base_url + 'meal/99/',
            params=data,
        )

        self.assertIn('success', r.json())
        self.assertFalse(r.json()['success'])

    def test_valid_deletion(self):
        session = models.Session()
        user1 = session.query(models.User).filter_by(email='user1@lc.com').first()
        data = {
            'access_token': user1.access_token,
        }

        user_meal = models.UserMeal(
            user=user1,
            meal_id=1
        )
        session.add(user_meal)
        session.commit()
        session.close()

        r = requests.delete(
            base_url + 'meal/1/',
            params=data,
        )

        self.assertIn('success', r.json())
        self.assertTrue(r.json()['success'])
        self.assertIn('meal', r.json())


if __name__ == '__main__':
    unittest.main()
