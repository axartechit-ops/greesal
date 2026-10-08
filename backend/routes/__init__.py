from .health import health_bp
from .salads import salads_bp
from .orders import orders_bp
from .reviews import reviews_bp
from .settings import settings_bp
from .auth import auth_bp
from .location import location_bp

__all__ = [
    'health_bp',
    'salads_bp',
    'orders_bp',
    'reviews_bp',
    'settings_bp',
    'auth_bp',
    'location_bp'
]
