# Dependencies

* Python 2.7
* pip
* Postgres
* python-psycopg2


# Setup instructions

- initialize virtualenv `virtualenv venv`
- activate virtualenv `source ./venv/bin/activate`
- install python dependencies `pip install -r reqs.txt`
- copy server configuration file `cp server.conf.example server.conf`
- copy db configuration file `cp db.conf.example.yaml db.conf`
- run `python models.py` to generate initial schema
