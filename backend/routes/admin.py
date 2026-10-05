from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, DonorProfile, BloodRequest, DonationMatch

admin_bp = Blueprint('admin', __name__)

def require_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return None, jsonify({'error': 'Admin access required'}), 403
    return user, None, None


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    total_users = User.query.count()
    total_donors = User.query.filter_by(role='donor').count()
    active_donors = DonorProfile.query.filter_by(availability=True).count()
    total_requesters = User.query.filter_by(role='requester').count()
    active_requests = BloodRequest.query.filter(
        BloodRequest.status.in_(['PENDING', 'MATCHING'])
    ).count()
    urgent_requests = BloodRequest.query.filter_by(urgency='URGENT').filter(
        BloodRequest.status.in_(['PENDING', 'MATCHING'])
    ).count()
    accepted_matches = DonationMatch.query.filter_by(status='ACCEPTED').count()
    fulfilled_requests = BloodRequest.query.filter_by(status='FULFILLED').count()

    # Blood group distribution
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
    blood_group_stats = {}
    for bg in blood_groups:
        count = DonorProfile.query.filter_by(blood_group=bg).count()
        available = DonorProfile.query.filter_by(blood_group=bg, availability=True).count()
        blood_group_stats[bg] = {'total': count, 'available': available}

    return jsonify({
        'total_users': total_users,
        'total_donors': total_donors,
        'active_donors': active_donors,
        'total_requesters': total_requesters,
        'active_requests': active_requests,
        'urgent_requests': urgent_requests,
        'accepted_matches': accepted_matches,
        'fulfilled_requests': fulfilled_requests,
        'blood_group_stats': blood_group_stats
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@admin_bp.route('/requests', methods=['GET'])
@jwt_required()
def get_all_requests():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    reqs = BloodRequest.query.order_by(
        BloodRequest.urgency.desc(),
        BloodRequest.created_at.desc()
    ).all()
    return jsonify({'requests': [r.to_dict() for r in reqs]}), 200


@admin_bp.route('/donors', methods=['GET'])
@jwt_required()
def get_all_donors():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    profiles = DonorProfile.query.join(User).order_by(User.name).all()
    return jsonify({'donors': [p.to_dict() for p in profiles]}), 200


@admin_bp.route('/users/<int:uid>', methods=['DELETE'])
@jwt_required()
def delete_user(uid):
    user_id = int(get_jwt_identity())
    admin = User.query.get(user_id)
    if not admin or admin.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(uid)
    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete admin users'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200
