from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return str(uuid4())

class User(db.Model):
    __tablename__ = 'login'
    id = db.Column(db.String(3), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
