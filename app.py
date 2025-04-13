import os
from flask import Flask
from config import Config

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", Config.SECRET_KEY)
app.config['DEBUG'] = Config.DEBUG

# Import routes after app is created to avoid circular imports
from routes import routes  # noqa: E402, F401

# Register blueprints
app.register_blueprint(routes)