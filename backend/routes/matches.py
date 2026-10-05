from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, DonationMatch, BloodRequest

matches_bp = Blueprint('matches', __name__)


@matches_bp.route('/<int:match_id>/respond', methods=['POST'])
@jwt_required()
def respond_to_match(match_id):
    """Donor accepts or declines a match/request."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    match = DonationMatch.query.get_or_404(match_id)

    if match.donor_id != user_id:
        return jsonify({'error': 'Not authorized to respond to this match'}), 403

    data = request.get_json()
    action = data.get('action', '').upper()

    if action not in ['ACCEPT', 'DECLINE']:
        return jsonify({'error': 'Action must be ACCEPT or DECLINE'}), 400

    match.status = 'ACCEPTED' if action == 'ACCEPT' else 'DECLINED'

    # If accepted, update the blood request status
    if action == 'ACCEPT':
        blood_req = BloodRequest.query.get(match.blood_request_id)
        if blood_req and blood_req.status == 'MATCHING':
            blood_req.status = 'MATCHING'  # keep as matching (may need more donors)

    db.session.commit()

    return jsonify({
        'message': f'Request {match.status.lower()}',
        'match': match.to_dict()
    }), 200


@matches_bp.route('/donor/me', methods=['GET'])
@jwt_required()
def get_my_matches():
    """Get all matches (requests) for the logged-in donor."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role != 'donor':
        return jsonify({'error': 'Not a donor'}), 403

    matches = DonationMatch.query.filter_by(donor_id=user_id).order_by(
        DonationMatch.created_at.desc()
    ).all()

    result = []
    for m in matches:
        md = m.to_dict()
        br = BloodRequest.query.get(m.blood_request_id)
        if br:
            md['blood_request'] = br.to_dict()
        result.append(md)

    return jsonify({'matches': result}), 200


@matches_bp.route('/send/<int:request_id>/<int:donor_id>', methods=['POST'])
@jwt_required()
def send_request_to_donor(request_id, donor_id):
    """Requester sends a request to a specific donor (if not already sent)."""
    user_id = int(get_jwt_identity())
    blood_req = BloodRequest.query.get_or_404(request_id)

    if blood_req.requester_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403

    # Check if match already exists
    existing = DonationMatch.query.filter_by(
        blood_request_id=request_id,
        donor_id=donor_id
    ).first()

    if existing:
        return jsonify({'message': 'Request already sent to this donor', 'match': existing.to_dict()}), 200

    match = DonationMatch(
        blood_request_id=request_id,
        donor_id=donor_id,
        match_score=0,
        status='PENDING'
    )
    db.session.add(match)
    db.session.commit()

    return jsonify({'message': 'Request sent to donor', 'match': match.to_dict()}), 201
