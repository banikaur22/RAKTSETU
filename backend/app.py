from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import get_config
from models import db

def create_app():
    app = Flask(__name__)
    cfg = get_config()
    app.config.from_object(cfg)

    # Extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": cfg.CORS_ORIGINS}}, supports_credentials=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.donors import donors_bp
    from routes.requests import requests_bp
    from routes.matches import matches_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(donors_bp, url_prefix='/api/donors')
    app.register_blueprint(requests_bp, url_prefix='/api/requests')
    app.register_blueprint(matches_bp, url_prefix='/api/matches')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # JWT error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({'error': 'Authentication required'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({'error': 'Token has expired'}), 401

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'RAKTSETU API is running'}), 200

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
