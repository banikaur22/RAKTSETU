"""
Quick unit test for the matching engine — no Flask needed.
Run: python test_matching.py
"""
import sys
sys.path.insert(0, '.')

from services.matching import (
    can_donate_to, haversine_distance,
    BLOOD_COMPATIBILITY
)

def test_blood_compat():
    # O- is universal donor
    for bg in ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']:
        assert can_donate_to('O-', bg), f"O- should donate to {bg}"
    # AB+ can only donate to AB+
    for bg in ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-']:
        assert not can_donate_to('AB+', bg), f"AB+ should NOT donate to {bg}"
    assert can_donate_to('AB+', 'AB+'), "AB+ can donate to AB+"
    print("✅ Blood compatibility tests passed")

def test_haversine():
    # Model Town to Civil Lines Ludhiana — roughly 1-2 km
    d = haversine_distance(30.9100, 75.8600, 30.9050, 75.8520)
    assert 0.5 < d < 2.0, f"Expected ~1 km, got {d}"
    # Ludhiana to Chandigarh — roughly 100 km
    d2 = haversine_distance(30.9010, 75.8573, 30.7333, 76.7794)
    assert 80 < d2 < 120, f"Expected ~100 km, got {d2}"
    print(f"✅ Haversine tests passed (Model Town→Civil Lines: {d:.1f}km, Ludhiana→Chandigarh: {d2:.1f}km)")

if __name__ == '__main__':
    test_blood_compat()
    test_haversine()
    print("\n✅ All matching engine tests passed!")
