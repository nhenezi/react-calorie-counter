import bcrypt
import cherrypy
import models
from validate_email import validate_email

cherrypy.config.update('server.conf')

import json
import datetime
class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        else:
            return str(obj)
        return json.JSONEncoder.default(self, obj)


json_encoder = DateEncoder()

def json_handler(*args, **kwargs):
    # Adapted from cherrypy/lib/jsontools.py
    value = cherrypy.serving.request._json_inner_handler(*args, **kwargs)
    return json_encoder.iterencode(value)

class Auth(object):
    exposed = True
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out(handler=json_handler)
    def GET(self, access_token=None):
        """
        Retrieves authentication status.

        If `access_token` is valid it will return user information.
        """
        session = models.Session()
        user = models.User.get_from_token(access_token, session)
        resp = {}
        if user:
            resp = {'success': True, 'user': user.to_json()}
        else:
            resp = {'success': False}
        session.close()
        return resp

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out(handler=json_handler)
    def POST(self):
        """
        Tries to login user with email/password combination.

        If login is successful new access_token is generated
        """
        data = cherrypy.request.json
        if 'password' not in data or 'email' not in data:
            return {'success': False, 'error': 'Invalid username or password'}

        email = data['email'].lower()
        password = data['password'].encode('utf-8')

        session = models.Session()
        user = session.query(models.User).filter_by(email=email).first()
        if not user:
            session.close()
            return {'success': False, 'error': 'Invalid username or password'}

        if bcrypt.hashpw(password, user.password.encode('utf-8')) == user.password:
            user.generate_new_token()
            resp = user.to_json(access_token=True)
            session.close()

            return {'success': True, 'user': resp}

        session.close()
        return {'success': False, 'error': 'Invalid username or password'}



@cherrypy.popargs('meal_id')
class Meal(object):
    exposed = True

    @cherrypy.tools.json_out(handler=json_handler)
    def GET(self, access_token=None, meal_id=None):
        """
        Retrieves meail information.

        access_token is required for this endpoint.
        If meal_id is not set it will retrieve a list of all meals
        """
        session = models.Session()
        user = models.User.get_from_token(access_token, session)
        if not user:
            session.close()
            return {'success': False, 'error': 'Invalid access_token'}

        if meal_id == None:
            meals = [m.to_json() for m in session.query(models.Meal).all()]
            session.close()
            return meals
        else:
            meal = session.query(models.Meal).get(meal_id)
            if not meal_id:
                session.close()
                return {}
            session.close()
            return meal.to_json()

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out(handler=json_handler)
    def POST(self):
        """
        Creates a new meal and assigns it to user
        """

        data = cherrypy.request.json
        if 'access_token' not in data:
            return {'success': False, 'error': 'Invalid access_token'}

        session = models.Session()
        user = models.User.get_from_token(data['access_token'], session)
        if not user:
            session.close()
            return {'success': False, 'error': 'Invalid access_token'}

        if 'name' not in data:
            session.close()
            return {'success': False, 'error': 'Missing name attribute'}
        if 'calories' not in data:
            session.close()
            return {'success': False, 'error': 'Calories name attribute'}

        meal = models.Meal(
            name=data['name'],
            calories=data['calories']
        )
        session.add(meal)
        user_meal = models.UserMeal(
            user=user,
            meal=meal
        )
        session.add(user_meal)
        session.commit()
        resp = meal.to_json()
        session.close()

        return resp

    @cherrypy.tools.json_out(handler=json_handler)
    def DELETE(self, access_token=None, meal_id=None):
        """
        Marks meal as deleted
        """
        if meal_id is None:
            return {'success': False, 'error': 'meal_id has to be specified'}

        session = models.Session()
        user = models.User.get_from_token(access_token, session)
        if not user:
            session.close()
            return {'success': False, 'error': 'Invalid access_token'}

        meal = session.query(models.Meal).get(meal_id)
        if not meal:
            session.close()
            return {'success': False, 'error': 'Invalid meal_id'}

        for user_meal in user.meals:
            if user_meal.meal == meal:
                user_meal.deleted = True
                session.commit()
                resp = {'success': True, 'meal': meal.to_json()}
                session.close()

                return resp


        session.close()
        return {'success': False, 'error': 'Invalid meal_id'}

class User(object):
    exposed = True
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out(handler=json_handler)
    def POST(self):
        """
        Creates new user
        """

        data = cherrypy.request.json
        if 'email' not in data:
            return {'success': False, 'error': 'Email cannot be empty'}
        if 'password' not in data:
            return {'success': False, 'error': 'Password cannot be empty'}
        if not validate_email(data['email']):
            return {'success': False, 'error': 'Invalid email'}

        session = models.Session()
        email = data['email'].lower()
        password = data['password']

        user = session.query(models.User).filter_by(email=email).first()
        if user:
            session.close()
            return {'success': False,
                    'error': 'User with that email already exists'}

        user = models.User(
            email=email,
            password=bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(12))
        )

        session.add(user)
        session.commit()
        resp = user.to_json(access_token=True)
        session.close()

        return {'success': True, 'user': resp}

    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out(handler=json_handler)
    def PUT(self):
        """
        Updates user settings
        """
        data = cherrypy.request.json

        if 'access_token' not in data:
            return {'success': False, 'error': 'Invalid access_token'}

        session = models.Session()
        user = models.User.get_from_token(data['access_token'], session)
        if not user:
            session.close()
            return {'success': False, 'error': 'Invalid access_token'}

        if 'expected_calories' in data:
            user.expected_calories = data['expected_calories']
        if 'email' in data:
            if not validate_email(data['email']):
                session.close()
                return {'success': False, 'error': 'Invalid email'}
            user.email = data['email']

        session.commit()
        resp = user.to_json()
        session.close()

        return {'success': True, 'user': resp}



class Root(object):
    def __init__(self):
        self.auth = Auth()
        self.meal = Meal()
        self.user = User()

if __name__ == '__main__':
    conf = {
        '/': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher()
        }
    }

    cherrypy.quickstart(Root(), '/', conf)

