import bcrypt
import cherrypy
import models

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
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out(handler=json_handler)
    def GET(self, access_token):
        """
        Retrieves authentication status.

        If `access_token` is valid it will return user information.
        """
        session = models.Session()
        user = models.User.get_from_token(access_token, session)
        resp = {}
        if user:
            resp = user.to_json()
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
        password = data['password']

        session = models.Session()
        user = session.query(models.User).filter_by(email=email).first()
        if not user:
            session.close()
            return {'success': False, 'error': 'Invalid username or password'}

        if not bcrypt.hashpw(password, user.password) == user.password:
            return {'success': False, 'error': 'Invalid username or password'}

        user.generate_new_token()
        resp = user.to_json(access_token=True)
        session.close()

        return {'success': True, 'user': resp}


class Meal(object):
    pass

class User(object):
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

        session = models.Session()
        email = data['email'].lower()
        password = data['password']

        user = session.query(models.User).filter_by(email=email).first()
        if user:
            return {'success': False,
                    'error': 'User with that email already exists'}

        user = models.User(
            email=email,
            password=bcrypt.hashpw(password, bcrypt.gensalt(12))
        )

        session.add(user)
        session.commit()
        resp = user.to_json(access_token=True)
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

