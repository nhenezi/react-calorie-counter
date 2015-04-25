import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
import bcrypt

if not os.environ.get('TEST'):
    print "Don't run tests in production mode. Set TEST env variable for test run"
    sys.exit()

def reload():
    models.Base.metadata.drop_all(models.engine)
    models.Base.metadata.create_all(models.engine)
    init_users()
    init_meals()

def init_users():
    session = models.Session()
    user1 = models.User(
        email='user1@lc.com',
        password=bcrypt.hashpw('test'.encode('utf-8'), bcrypt.gensalt(12)),
        expected_calories=1500
    )
    session.add(user1)

    user2 = models.User(
        email='user2@lc.com',
        password=bcrypt.hashpw('test'.encode('utf-8'), bcrypt.gensalt(12)),
        expected_calories=2300
    )
    session.add(user2)

    session.commit()
    session.close()

def init_meals():
    session = models.Session()
    meal1 = models.UserMeal(
        name='Tomato',
        calories=100,
        user_id=1
    )

    session.add(meal1)

    meal2 = models.UserMeal(
        name='Potato',
        calories=150,
        user_id=1
    )
    session.add(meal2)

    session.commit()
    session.close()

reload()
