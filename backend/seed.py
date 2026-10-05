"""
Seed script for RAKTSETU demo data.
Run: python seed.py
"""
from app import create_app
from models import db, User, DonorProfile, BloodRequest, DonationMatch
from datetime import date, datetime, timedelta

app = create_app()

DONORS = [
    # (name, email, password, phone, blood_group, city, area, availability, last_donation_days_ago, lat, lon)
    ('Simran Kaur',     'simran@demo.com',   'Donor@123', '9876543210', 'O+',  'Ludhiana', 'Model Town',     True,  120, 30.9100, 75.8600),
    ('Aman Sharma',     'aman@demo.com',     'Donor@123', '9876543211', 'O+',  'Ludhiana', 'Civil Lines',    True,  90,  30.9050, 75.8520),
    ('Gurleen Kaur',    'gurleen@demo.com',  'Donor@123', '9876543212', 'B+',  'Ludhiana', 'Sarabha Nagar',  True,  180, 30.8950, 75.8450),
    ('Arjun Singh',     'arjun@demo.com',    'Donor@123', '9876543213', 'A+',  'Ludhiana', 'Dugri',          True,  200, 30.8800, 75.8700),
    ('Mehak Verma',     'mehak@demo.com',    'Donor@123', '9876543214', 'O-',  'Ludhiana', 'Model Town',     True,  150, 30.9120, 75.8580),
    ('Rajiv Malhotra',  'rajiv@demo.com',    'Donor@123', '9876543215', 'A-',  'Ludhiana', 'BRS Nagar',      True,  100, 30.9200, 75.8400),
    ('Priya Nanda',     'priya@demo.com',    'Donor@123', '9876543216', 'AB+', 'Ludhiana', 'Jawahar Nagar',  True,  60,  30.9080, 75.8650),
    ('Harpreet Singh',  'harpreet@demo.com', 'Donor@123', '9876543217', 'B-',  'Ludhiana', 'Bhai Randhir Singh Nagar', True, 250, 30.8900, 75.8550),
    ('Navdeep Gill',    'navdeep@demo.com',  'Donor@123', '9876543218', 'O+',  'Ludhiana', 'Gurdev Nagar',   False, 30,  30.9150, 75.8480),
    ('Sunita Rani',     'sunita@demo.com',   'Donor@123', '9876543219', 'A+',  'Ludhiana', 'Shastri Nagar',  True,  300, 30.9030, 75.8720),
    ('Vikram Bedi',     'vikram@demo.com',   'Donor@123', '9876543220', 'O-',  'Chandigarh', 'Sector 17',    True,  180, 30.7400, 76.7800),
    ('Anita Chopra',    'anita@demo.com',    'Donor@123', '9876543221', 'AB-', 'Chandigarh', 'Sector 22',    True,  200, 30.7350, 76.7750),
    ('Rohit Kumar',     'rohit@demo.com',    'Donor@123', '9876543222', 'B+',  'Ludhiana', 'Pakhowal Road',  True,  110, 30.9000, 75.8600),
    ('Deepika Jain',    'deepika@demo.com',  'Donor@123', '9876543223', 'A+',  'Ludhiana', 'Ferozepur Road', True,  220, 30.8850, 75.8480),
    ('Manpreet Kaur',   'manpreet@demo.com', 'Donor@123', '9876543224', 'O+',  'Ludhiana', 'Haibowal',       True,  160, 30.9180, 75.8320),
]

REQUESTERS = [
    ('Rajan Mehta',    'requester@raktsetu.com', 'Requester@123', '9876500001'),
    ('Neha Sharma',    'neha_req@demo.com',      'Req@123',       '9876500002'),
    ('Dr. Anand Puri', 'anand_req@demo.com',     'Req@123',       '9876500003'),
]

ADMIN = ('Admin RAKTSETU', 'admin@raktsetu.com', 'Admin@123', '9000000000')

# Demo donor login
DEMO_DONOR = ('donor@raktsetu.com', 'Donor@123')


def seed():
    with app.app_context():
        db.drop_all()
        db.create_all()
        print('Database tables created.')

        # ---- Admin ----
        admin = User(name=ADMIN[0], email=ADMIN[1], role='admin', phone=ADMIN[3])
        admin.set_password(ADMIN[2])
        db.session.add(admin)

        # ---- Donors ----
        donor_users = []
        for i, d in enumerate(DONORS):
            name, email, pwd, phone, bg, city, area, avail, last_days, lat, lon = d
            user = User(name=name, email=email, role='donor', phone=phone)
            user.set_password(pwd)
            db.session.add(user)
            db.session.flush()

            last_date = date.today() - timedelta(days=last_days)
            profile = DonorProfile(
                user_id=user.id,
                blood_group=bg,
                city=city,
                area=area,
                availability=avail,
                last_donation_date=last_date,
                latitude=lat,
                longitude=lon
            )
            db.session.add(profile)
            donor_users.append((user, profile))

            # Set the first donor as the demo donor account
            if i == 0:
                pass  # simran@demo.com is a demo donor already

        # Create a dedicated demo donor account
        demo_donor_user = User(name='Demo Donor', email='donor@raktsetu.com', role='donor', phone='9876599999')
        demo_donor_user.set_password('Donor@123')
        db.session.add(demo_donor_user)
        db.session.flush()
        demo_profile = DonorProfile(
            user_id=demo_donor_user.id,
            blood_group='O+',
            city='Ludhiana',
            area='Model Town',
            availability=True,
            last_donation_date=date.today() - timedelta(days=100),
            latitude=30.9100,
            longitude=75.8600
        )
        db.session.add(demo_profile)

        # ---- Requesters ----
        requester_users = []
        for name, email, pwd, phone in REQUESTERS:
            user = User(name=name, email=email, role='requester', phone=phone)
            user.set_password(pwd)
            db.session.add(user)
            requester_users.append(user)

        db.session.flush()

        # ---- Blood Requests ----
        # Request 1: URGENT O+
        req1 = BloodRequest(
            requester_id=requester_users[0].id,
            blood_group='O+',
            units_required=2,
            hospital_name='DMC Hospital',
            hospital_location='Tagore Nagar, Ludhiana',
            city='Ludhiana',
            urgency='URGENT',
            status='MATCHING',
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.session.add(req1)

        # Request 2: Normal B+
        req2 = BloodRequest(
            requester_id=requester_users[1].id,
            blood_group='B+',
            units_required=1,
            hospital_name='SPS Hospital',
            hospital_location='Sherpur Chowk, Ludhiana',
            city='Ludhiana',
            urgency='NORMAL',
            status='MATCHING',
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        db.session.add(req2)

        # Request 3: URGENT A+ — fulfilled
        req3 = BloodRequest(
            requester_id=requester_users[2].id,
            blood_group='A+',
            units_required=3,
            hospital_name='CMCH Ludhiana',
            hospital_location='Brown Road, Ludhiana',
            city='Ludhiana',
            urgency='URGENT',
            status='FULFILLED',
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(req3)

        # Request 4: O- Normal
        req4 = BloodRequest(
            requester_id=requester_users[0].id,
            blood_group='O-',
            units_required=2,
            hospital_name='Fortis Hospital',
            hospital_location='Chandigarh Road, Ludhiana',
            city='Ludhiana',
            urgency='NORMAL',
            status='PENDING',
            created_at=datetime.utcnow() - timedelta(hours=1)
        )
        db.session.add(req4)

        db.session.flush()

        # ---- Matches for req1 (URGENT O+) ----
        # O+ and O- donors can donate to O+
        # Simran (O+), Aman (O+), Mehak (O-), Manpreet (O+), Navdeep (O+), Demo donor (O+)
        match1 = DonationMatch(blood_request_id=req1.id, donor_id=donor_users[0][0].id, match_score=95, distance=0.5, status='PENDING')
        match2 = DonationMatch(blood_request_id=req1.id, donor_id=donor_users[1][0].id, match_score=90, distance=1.2, status='ACCEPTED')
        match3 = DonationMatch(blood_request_id=req1.id, donor_id=donor_users[4][0].id, match_score=88, distance=0.4, status='PENDING')
        db.session.add_all([match1, match2, match3])

        # ---- Matches for req2 (B+) ----
        match4 = DonationMatch(blood_request_id=req2.id, donor_id=donor_users[2][0].id, match_score=92, distance=2.1, status='PENDING')
        match5 = DonationMatch(blood_request_id=req2.id, donor_id=donor_users[12][0].id, match_score=85, distance=3.4, status='DECLINED')
        db.session.add_all([match4, match5])

        # ---- Match for req3 (fulfilled) ----
        match6 = DonationMatch(blood_request_id=req3.id, donor_id=donor_users[3][0].id, match_score=96, distance=1.8, status='ACCEPTED')
        match7 = DonationMatch(blood_request_id=req3.id, donor_id=donor_users[9][0].id, match_score=88, distance=2.5, status='ACCEPTED')
        db.session.add_all([match6, match7])

        db.session.commit()
        print('\n✅ Seed data inserted successfully!\n')
        print('='*50)
        print('DEMO CREDENTIALS')
        print('='*50)
        print(f'Admin:     admin@raktsetu.com     / Admin@123')
        print(f'Donor:     donor@raktsetu.com     / Donor@123')
        print(f'Requester: requester@raktsetu.com / Requester@123')
        print('='*50)
        print(f'Total donors: {len(DONORS) + 1}')
        print(f'Total requesters: {len(REQUESTERS)}')
        print(f'Total blood requests: 4')
        print('='*50)


if __name__ == '__main__':
    seed()
