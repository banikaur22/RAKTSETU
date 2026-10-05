from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, DonorProfile
from datetime import date

donors_bp = Blueprint('donors', __name__)

VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

@donors_bp.route('', methods=['GET'])
def get_donors():
    """Get all donors with their profiles (public, for matching display)."""
    profiles = DonorProfile.query.join(User).filter(DonorProfile.availability == True).all()
    return jsonify({'donors': [p.to_dict() for p in profiles]}), 200


@donors_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_donors():
    """Get all donors including unavailable (admin/internal use)."""
    profiles = DonorProfile.query.join(User).all()
    return jsonify({'donors': [p.to_dict() for p in profiles]}), 200


@donors_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'donor':
        return jsonify({'error': 'Donor profile not found'}), 404

    profile = DonorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'profile': None, 'user': user.to_dict()}), 200

    return jsonify({'profile': profile.to_dict(), 'user': user.to_dict()}), 200


@donors_bp.route('/me', methods=['POST', 'PUT'])
@jwt_required()
def upsert_my_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'donor':
        return jsonify({'error': 'Only donors can create a donor profile'}), 403

    data = request.get_json()

    if not data.get('blood_group') or data['blood_group'] not in VALID_BLOOD_GROUPS:
        return jsonify({'error': 'Valid blood group is required'}), 400

    # Update phone if provided
    if data.get('phone'):
        user.phone = data['phone']

    profile = DonorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = DonorProfile(user_id=user_id)
        db.session.add(profile)

    profile.blood_group = data['blood_group']
    profile.city = data.get('city', '')
    profile.area = data.get('area', '')
    profile.availability = data.get('availability', True)

    if data.get('latitude'):
        profile.latitude = float(data['latitude'])
    if data.get('longitude'):
        profile.longitude = float(data['longitude'])

    if data.get('last_donation_date'):
        try:
            profile.last_donation_date = date.fromisoformat(data['last_donation_date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

    db.session.commit()
    return jsonify({'message': 'Profile saved', 'profile': profile.to_dict()}), 200


@donors_bp.route('/me/availability', methods=['PATCH'])
@jwt_required()
def toggle_availability():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'donor':
        return jsonify({'error': 'Not a donor'}), 403

    profile = DonorProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Donor profile not found. Please complete your profile first.'}), 404

    data = request.get_json()
    profile.availability = data.get('availability', not profile.availability)
    db.session.commit()

    return jsonify({
        'message': 'Availability updated',
        'availability': profile.availability
    }), 200
