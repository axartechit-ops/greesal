from .health import router as health_router
from .salads import router as salads_router
from .orders import router as orders_router
from .reviews import router as reviews_router
from .settings import router as settings_router
from .auth import router as auth_router
from .location import router as location_router
from .users import router as users_router

__all__ = [
    "health_router",
    "salads_router",
    "orders_router",
    "reviews_router",
    "settings_router",
    "auth_router",
    "location_router",
    "users_router",
]
