import os
import logging
from flask import Flask
from flask_cors import CORS
from config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize NLTK resources
from nltk_setup import initialize_nltk  # noqa: E402
logger.info("Initializing NLTK resources...")
initialize_nltk()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", Config.SECRET_KEY)
app.config['DEBUG'] = Config.DEBUG

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:3000"])

# Import routes after app is created to avoid circular imports
from routes import routes  # noqa: E402, F401

# Register blueprints
app.register_blueprint(routes)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)