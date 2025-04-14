import os
import logging
import sys
from flask import Flask
from config import Config

# Configure logging with proper handlers
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Global error handler
def handle_error(e):
    logger.error(f"Application error: {str(e)}")
    return "An error occurred", 500

# Initialize NLTK resources
from nltk_setup import initialize_nltk  # noqa: E402
logger.info("Initializing NLTK resources...")
initialize_nltk()

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", Config.SECRET_KEY)
app.config['DEBUG'] = Config.DEBUG

# Import routes after app is created to avoid circular imports
from routes import routes  # noqa: E402, F401

# Register blueprints
app.register_blueprint(routes)