from sqlalchemy import create_engine, Boolean, Column, Integer, String
from sqlalchemy import ForeignKey, Numeric, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref, sessionmaker

import yaml
import datetime
import random
import string

conf_f = file('./db.conf', 'r')
db_conf = yaml.load(conf_f)['database']
conf_f.close()

engine = create_engine(
    'postgresql://%s:%s@%s/%s'
    % (db_conf['user'], db_conf['password'], db_conf['host'],
       db_conf['db_name']))

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

    meals = relationship('UserMeal')

    def __repr__(self):
        return "<User(%s, email=%s)>" % (self.id, self.email)

class Meal(Base):
    __tablename__ = 'meal'

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    calories = Column(Integer)

    def __repr__(self):
        return "<Meal(%s, name=%s, cal=%s)" % (self.id, self.name,
                                               self.calories)

class UserMeal(Base):
    __tablename__ = 'user_meal'

    user_id = Column(Integer, ForeignKey('user.id'), primary_key=True)
    meal_id = Column(Integer, ForeignKey('meal.id'), primary_key=True)
    time = Column(DateTime, default=datetime.datetime.utcnow)
    deleted = Column(Boolean)

    user = relationship('User')
    meal = relationship('Meal')

    def __repr__(self):
        return "<UserMeal(user=%s, meal=%s, time=%s, deleted=%s)" % (
            self.user, self.meal, self.time, self.deleted
        )

if __name__ == '__main__':
    Base.metadata.create_all(engine)
