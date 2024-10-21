import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_default_secret_key'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your_default_jwt_secret_key'
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.yourmailserver.com'
    MAIL_PORT = os.environ.get('MAIL_PORT') or 587
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'your-email@example.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'your-email-password'
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') or True
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL') or False
