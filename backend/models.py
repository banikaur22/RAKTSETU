from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='requester')  # donor, requester, admin
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    donor_profile = db.relationship('DonorProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    blood_requests = db.relationship('BloodRequest', backref='requester', foreign_keys='BloodRequest.requester_id', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'created_at': self.created_at.isoformat()
        }


class DonorProfile(db.Model):
    __tablename__ = 'donor_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    blood_group = db.Column(db.String(5), nullable=False)
    city = db.Column(db.String(100))
    area = db.Column(db.String(100))
    availability = db.Column(db.Boolean, default=True)
    last_donation_date = db.Column(db.Date)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'blood_group': self.blood_group,
            'city': self.city,
            'area': self.area,
            'availability': self.availability,
            'last_donation_date': self.last_donation_date.isoformat() if self.last_donation_date else None,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'user': self.user.to_dict() if self.user else None
        }


class BloodRequest(db.Model):
    __tablename__ = 'blood_requests'

    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    units_required = db.Column(db.Integer, nullable=False, default=1)
    hospital_name = db.Column(db.String(200), nullable=False)
    hospital_location = db.Column(db.String(200))
    city = db.Column(db.String(100))
    urgency = db.Column(db.String(10), nullable=False, default='NORMAL')  # NORMAL, URGENT
    status = db.Column(db.String(20), nullable=False, default='PENDING')  # PENDING, MATCHING, FULFILLED, CANCELLED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    matches = db.relationship('DonationMatch', backref='blood_request', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'requester_id': self.requester_id,
            'blood_group': self.blood_group,
            'units_required': self.units_required,
            'hospital_name': self.hospital_name,
            'hospital_location': self.hospital_location,
            'city': self.city,
            'urgency': self.urgency,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'requester_name': self.requester.name if self.requester else None
        }


class DonationMatch(db.Model):
    __tablename__ = 'donation_matches'

    id = db.Column(db.Integer, primary_key=True)
    blood_request_id = db.Column(db.Integer, db.ForeignKey('blood_requests.id'), nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    match_score = db.Column(db.Integer, default=0)
    distance = db.Column(db.Float)
    status = db.Column(db.String(20), nullable=False, default='PENDING')  # PENDING, ACCEPTED, DECLINED, FULFILLED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    donor = db.relationship('User', foreign_keys=[donor_id])

    def to_dict(self):
        donor_profile = self.donor.donor_profile if self.donor else None
        return {
            'id': self.id,
            'blood_request_id': self.blood_request_id,
            'donor_id': self.donor_id,
            'match_score': self.match_score,
            'distance': self.distance,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'donor_name': self.donor.name if self.donor else None,
            'donor_phone': self.donor.phone if self.donor else None,
            'donor_blood_group': donor_profile.blood_group if donor_profile else None,
            'donor_city': donor_profile.city if donor_profile else None,
            'donor_area': donor_profile.area if donor_profile else None,
            'donor_availability': donor_profile.availability if donor_profile else None,
        }
