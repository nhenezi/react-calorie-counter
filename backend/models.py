from sqlalchemy import create_engine, Boolean, Column, Integer, String
from sqlalchemy import ForeignKey, Numeric, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker

import yaml
import datetime
import random
import string
import os

conf_f = file('./db.conf', 'r')
db_conf = yaml.load(conf_f)
if os.environ.get('TEST'):
    db_conf = db_conf['database_test']
else:
    db_conf = db_conf['database']
conf_f.close()

engine = create_engine(
    'postgresql://%s:%s@%s/%s'
    % (db_conf['user'], db_conf['password'], db_conf['host'],
       db_conf['db_name']), client_encoding='utf-8')

Session = sessionmaker(bind=engine)
Base = declarative_base()

AUTHKEY_MIN_LENGTH = 40
AUTHKEY_MAX_LENGTH = 55
AUTHKEY_VERSION = 1

def random_auth_key():
    key_length = random.choice([
        i for i in xrange(AUTHKEY_MIN_LENGTH, AUTHKEY_MAX_LENGTH)
    ])
    return str(AUTHKEY_VERSION) + ''.join(
        random.choice(string.lowercase) for _ in xrange(key_length)
    )

class User(Base):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True)
    password = Column(String(255))
    created = Column(DateTime, default=datetime.datetime.utcnow)
    expected_calories = Column(Integer, default=2000)
    access_token = Column(String(255), default=random_auth_key)

    meals = relationship(
        'UserMeal',
        primaryjoin='and_(User.id==UserMeal.user_id, UserMeal.deleted==False)',
        order_by='UserMeal.time'
    )

    def __repr__(self):
        return "<User(%s, email=%s)>" % (self.id, self.email)

    @staticmethod
    def get_from_token(token, session):
        """
        Retrieves user from tokenk
        """
        return session.query(User).filter(User.access_token == token).first()

    def generate_new_token(self):
        """
        Generates new access token
        """
        self.access_token = random_auth_key()

    def to_json(self, access_token=False, direction=None):
        data = {
            'id': self.id,
            'email': self.email,
            'created': self.created,
            'expected_calories': self.expected_calories
        }

        if direction != 'meal':
            data['meals'] = [m.to_json(direction='user') for m in self.meals]

        if access_token:
            data['access_token'] = self.access_token

        return data

class UserMeal(Base):
    __tablename__ = 'user_meal'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    calories = Column(Integer)
    user_id = Column(Integer, ForeignKey('user.id'), primary_key=True)
    time = Column(DateTime, default=datetime.datetime.utcnow)
    deleted = Column(Boolean, default=False)

    def __repr__(self):
        return "<UserMeal(%s, user=%s, cal=%s, time=%s, deleted=%s)" % (
            self.id, self.user, self.calories, self.time, self.deleted
        )

    def to_json(self, direction=None):
        data = {
            'id': self.id,
            'name': self.name,
            'calories': self.calories,
            'time': self.time,
            'deleted': self.deleted
        }

        if direction == 'meal':
            data['user'] = self.user.to_json()

        return data

if __name__ == '__main__':
    Base.metadata.create_all(engine)
