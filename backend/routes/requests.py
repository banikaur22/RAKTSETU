from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, BloodRequest, DonorProfile, DonationMatch
from services.matching import find_matching_donors

requests_bp = Blueprint('requests', __name__)

VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

# Demo hospital coordinates (Ludhiana area)
CITY_COORDINATES = {
    'ludhiana': (30.9010, 75.8573),
    'chandigarh': (30.7333, 76.7794),
    'amritsar': (31.6340, 74.8723),
    'jalandhar': (31.3260, 75.5762),
    'patiala': (30.3398, 76.3869),
    'delhi': (28.6139, 77.2090),
    'mumbai': (19.0760, 72.8777),
}


def get_city_coords(city_name):
    if not city_name:
        return None, None
    key = city_name.lower().strip()
    coords = CITY_COORDINATES.get(key)
    if coords:
        return coords
    return None, None


@requests_bp.route('', methods=['POST'])
@jwt_required()
def create_request():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user or user.role not in ['requester', 'admin']:
        return jsonify({'error': 'Only requesters can create blood requests'}), 403

    data = request.get_json()

    # Validation
    required = ['blood_group', 'units_required', 'hospital_name']
    for field in required:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    if data['blood_group'] not in VALID_BLOOD_GROUPS:
        return jsonify({'error': 'Invalid blood group'}), 400

    urgency = data.get('urgency', 'NORMAL').upper()
    if urgency not in ['NORMAL', 'URGENT']:
        urgency = 'NORMAL'

    blood_req = BloodRequest(
        requester_id=user_id,
        blood_group=data['blood_group'],
        units_required=int(data['units_required']),
        hospital_name=data['hospital_name'],
        hospital_location=data.get('hospital_location', ''),
        city=data.get('city', ''),
        urgency=urgency,
        status='PENDING'
    )
    db.session.add(blood_req)
    db.session.flush()  # get ID before commit

    # Run matching engine
    all_profiles = DonorProfile.query.join(User).all()
    hospital_lat, hospital_lon = get_city_coords(data.get('city'))

    matches = find_matching_donors(blood_req, all_profiles, hospital_lat, hospital_lon)

    for m in matches:
        match = DonationMatch(
            blood_request_id=blood_req.id,
            donor_id=m['donor_profile'].user_id,
            match_score=m['score'],
            distance=m['distance'],
            status='PENDING'
        )
        db.session.add(match)

    if matches:
        blood_req.status = 'MATCHING'

    db.session.commit()

    return jsonify({
        'message': 'Blood request created',
        'request': blood_req.to_dict(),
        'matches_found': len(matches)
    }), 201


@requests_bp.route('', methods=['GET'])
@jwt_required()
def get_requests():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user.role == 'admin':
        reqs = BloodRequest.query.order_by(BloodRequest.created_at.desc()).all()
    elif user.role == 'requester':
        reqs = BloodRequest.query.filter_by(requester_id=user_id).order_by(BloodRequest.created_at.desc()).all()
    else:
        # Donors see all active requests that match them
        reqs = BloodRequest.query.filter(
            BloodRequest.status.in_(['PENDING', 'MATCHING'])
        ).order_by(BloodRequest.urgency.desc(), BloodRequest.created_at.desc()).all()

    return jsonify({'requests': [r.to_dict() for r in reqs]}), 200


@requests_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_request(request_id):
    blood_req = BloodRequest.query.get_or_404(request_id)
    return jsonify({'request': blood_req.to_dict()}), 200


@requests_bp.route('/<int:request_id>/matches', methods=['GET'])
@jwt_required()
def get_matches(request_id):
    blood_req = BloodRequest.query.get_or_404(request_id)
    matches = DonationMatch.query.filter_by(blood_request_id=request_id).order_by(
        DonationMatch.match_score.desc()
    ).all()

    match_list = []
    for m in matches:
        md = m.to_dict()
        # Also include reasons
        if m.donor and m.donor.donor_profile:
            hospital_lat, hospital_lon = get_city_coords(blood_req.city)
            from services.matching import calculate_match_score
            _, reasons, _ = calculate_match_score(
                m.donor.donor_profile, blood_req, hospital_lat, hospital_lon
            )
            md['reasons'] = reasons
        else:
            md['reasons'] = []
        match_list.append(md)

    return jsonify({
        'request': blood_req.to_dict(),
        'matches': match_list
    }), 200


@requests_bp.route('/<int:request_id>', methods=['DELETE'])
@jwt_required()
def cancel_request(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    blood_req = BloodRequest.query.get_or_404(request_id)

    if user.role != 'admin' and blood_req.requester_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403

    blood_req.status = 'CANCELLED'
    db.session.commit()
    return jsonify({'message': 'Request cancelled'}), 200


@requests_bp.route('/<int:request_id>/fulfill', methods=['PATCH'])
@jwt_required()
def fulfill_request(request_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    blood_req = BloodRequest.query.get_or_404(request_id)

    if user.role != 'admin' and blood_req.requester_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403

    blood_req.status = 'FULFILLED'
    db.session.commit()
    return jsonify({'message': 'Request marked as fulfilled', 'request': blood_req.to_dict()}), 200
