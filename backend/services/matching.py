import math
from datetime import date, datetime

# Blood compatibility chart: donor -> list of compatible recipients
BLOOD_COMPATIBILITY = {
    'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+':  ['O+', 'A+', 'B+', 'AB+'],
    'A-':  ['A-', 'A+', 'AB-', 'AB+'],
    'A+':  ['A+', 'AB+'],
    'B-':  ['B-', 'B+', 'AB-', 'AB+'],
    'B+':  ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+'],
}

def can_donate_to(donor_blood_group, recipient_blood_group):
    """Check if a donor with given blood group can donate to the recipient."""
    compatible = BLOOD_COMPATIBILITY.get(donor_blood_group, [])
    return recipient_blood_group in compatible

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two coordinates using Haversine formula."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def days_since_last_donation(last_donation_date):
    """Return number of days since last donation."""
    if not last_donation_date:
        return 999
    if isinstance(last_donation_date, str):
        last_donation_date = date.fromisoformat(last_donation_date)
    return (date.today() - last_donation_date).days

def calculate_match_score(donor_profile, blood_request, hospital_lat=None, hospital_lon=None):
    """
    Calculate a match score for a donor against a blood request.
    Returns (score, reasons, distance) tuple.
    score: 0-100
    reasons: list of reason strings
    distance: km or None
    """
    score = 0
    reasons = []

    # 1. Blood group compatibility — mandatory
    if not can_donate_to(donor_profile.blood_group, blood_request.blood_group):
        return None, [], None  # Not compatible

    score += 50
    reasons.append('Compatible blood group')

    # 2. Availability — mandatory
    if not donor_profile.availability:
        return None, [], None  # Not available

    score += 30
    reasons.append('Currently available')

    # 3. Last donation check — at least 56 days (8 weeks) ago
    days = days_since_last_donation(donor_profile.last_donation_date)
    if days < 56:
        # Still score them but note it
        score -= 20
    else:
        reasons.append('Eligible to donate')

    # 4. Location score
    distance = None
    if (donor_profile.latitude and donor_profile.longitude and
            hospital_lat and hospital_lon):
        distance = haversine_distance(
            donor_profile.latitude, donor_profile.longitude,
            hospital_lat, hospital_lon
        )
        if distance <= 5:
            score += 15
            reasons.append('Nearby (within 5 km)')
        elif distance <= 10:
            score += 10
            reasons.append('Nearby (within 10 km)')
        elif distance <= 20:
            score += 5
            reasons.append('Within 20 km')
        else:
            reasons.append('Same city')
    elif donor_profile.city and blood_request.city:
        if donor_profile.city.strip().lower() == blood_request.city.strip().lower():
            score += 10
            reasons.append('Same city')

    # 5. Urgency boost
    if blood_request.urgency == 'URGENT':
        score += 5

    # Clamp to 100
    score = min(score, 100)
    return score, reasons, round(distance, 1) if distance else None


def find_matching_donors(blood_request, all_donor_profiles, hospital_lat=None, hospital_lon=None):
    """
    Find and rank all potentially matching donors for a blood request.
    Returns sorted list of (donor_profile, score, reasons, distance).
    """
    results = []

    for profile in all_donor_profiles:
        score, reasons, distance = calculate_match_score(
            profile, blood_request, hospital_lat, hospital_lon
        )
        if score is not None and score > 0:
            results.append({
                'donor_profile': profile,
                'score': score,
                'reasons': reasons,
                'distance': distance
            })

    # Sort: urgent requests prioritize nearby + high score
    results.sort(key=lambda x: (-(x['score']), x['distance'] or 9999))
    return results
