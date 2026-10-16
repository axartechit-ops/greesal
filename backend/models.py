from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timezone
from pydantic import BaseModel, Field, EmailStr, ConfigDict

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        extra="allow"
    )

class NutritionInfo(BaseModel):
    model_config = ConfigDict(extra="allow")
    calories: Optional[str] = "410 kcal"
    protein: Optional[str] = "24g"
    carbs: Optional[str] = "38g"
    fat: Optional[str] = "14g"
    fiber: Optional[str] = "11g"
    sodium: Optional[str] = "280mg"
    vitamins: Optional[str] = "A, C, K, B-Complex"

class SaladAddOn(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: str
    price: float = 40.0

class SaladBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    name: str
    slug: Optional[str] = None
    tag: str = "Chef Choice"
    category: Optional[str] = None
    price: str = "₹299"
    originalPrice: Optional[str] = "₹349"
    description: Optional[str] = ""
    calories: str = "410 kcal"
    protein: str = "24g"
    carbs: Optional[str] = "38g"
    fat: Optional[str] = "14g"
    image: str
    rating: Optional[float] = 4.9
    reviews: Optional[int] = 142
    prepTime: Optional[str] = "10-15 mins"
    isAvailable: Optional[bool] = True
    isVegetarian: Optional[bool] = True
    isVegan: Optional[bool] = False
    isGlutenFree: Optional[bool] = True
    ingredients: List[str] = Field(default_factory=list)
    gravy: Optional[List[str]] = Field(default_factory=list)
    healthBenefits: List[str] = Field(default_factory=list)
    additionalBenefits: Optional[List[str]] = Field(default_factory=list)
    perfectFor: Optional[List[str]] = Field(default_factory=list)
    nutrition: Optional[Union[NutritionInfo, Dict[str, Any]]] = None
    dressing: Optional[str] = "100% Freeze-Dried Cold-Blended Dressing"
    addOns: Optional[List[SaladAddOn]] = Field(default_factory=list)

class SaladCreate(SaladBase):
    pass

class SaladUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    name: Optional[str] = None
    slug: Optional[str] = None
    tag: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = None
    originalPrice: Optional[str] = None
    description: Optional[str] = None
    calories: Optional[str] = None
    protein: Optional[str] = None
    carbs: Optional[str] = None
    fat: Optional[str] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    prepTime: Optional[str] = None
    isAvailable: Optional[bool] = None
    isVegetarian: Optional[bool] = None
    isVegan: Optional[bool] = None
    isGlutenFree: Optional[bool] = None
    ingredients: Optional[List[str]] = None
    gravy: Optional[List[str]] = None
    healthBenefits: Optional[List[str]] = None
    additionalBenefits: Optional[List[str]] = None
    perfectFor: Optional[List[str]] = None
    nutrition: Optional[Union[NutritionInfo, Dict[str, Any]]] = None
    dressing: Optional[str] = None
    addOns: Optional[List[SaladAddOn]] = None

# Cart and Orders
class CartItemSchema(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: Optional[str] = None
    name: str
    price: Any
    image: Optional[str] = ""
    quantity: int = 1
    selectedAddOns: Optional[List[Any]] = None

class OrderCreate(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: Optional[str] = None
    orderNumber: Optional[str] = None
    customerName: str = "Greesal Member"
    customerEmail: Optional[str] = ""
    customerMobile: Optional[str] = ""
    deliveryAddress: Optional[str] = ""
    deliverySlot: Optional[str] = "lunch"
    deliveryNote: Optional[str] = None
    mapsUrl: Optional[str] = ""
    locationCoords: Optional[Dict[str, Any]] = None
    notes: Optional[str] = ""
    orderType: Optional[str] = "salad_order"
    dietPreference: Optional[str] = ""
    items: List[CartItemSchema] = Field(default_factory=list)
    subtotal: float = 0.0
    deliveryFee: float = 0.0
    total: float = 0.0
    paymentMethod: str = "Cash on Delivery / UPI on Delivery"
    status: str = "Placed"

class OrderStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: Optional[str] = None
    order_id: Optional[str] = Field(default=None, alias="_id")
    status: str

# Reviews
class ReviewCreate(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: Optional[str] = None
    author: Optional[str] = None
    location: Optional[str] = "Surat"
    role: Optional[str] = "Verified Customer"
    text: Optional[str] = None
    comment: Optional[str] = None
    rating: int = 5
    isPinned: Optional[bool] = False
    order: Optional[int] = 99
    status: Optional[str] = "approved"

class AdminReviewPayload(BaseModel):
    model_config = ConfigDict(extra="allow")
    action: Optional[str] = None
    reviewId: Optional[Any] = None
    data: Optional[Dict[str, Any]] = None
    orderedIds: Optional[List[str]] = None

# Users
class UserCreate(BaseModel):
    model_config = ConfigDict(extra="allow")
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    google_id: Optional[str] = None
    mobile: Optional[str] = None

class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="allow")
    name: Optional[str] = None
    image: Optional[str] = None
    mobile: Optional[str] = None

class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")
    id: Optional[str] = Field(default=None, alias="_id")
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    google_id: Optional[str] = None
    mobile: Optional[str] = None
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)

# Auth & OTP
class OTPRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    email: Optional[str] = None
    identifier: Optional[str] = None
    mobileNumber: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    email: Optional[str] = None
    identifier: Optional[str] = None
    mobileNumber: Optional[str] = None
    otp: str
    password: Optional[str] = None
    name: Optional[str] = None

class LoginVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    email: Optional[str] = None
    identifier: Optional[str] = None
    mobileNumber: Optional[str] = None
    password: Optional[str] = None
    otp: Optional[str] = None

class RegisterRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    email: str
    password: str
    mobile: str
    otp: str
    name: Optional[str] = None

class AdminLoginRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    username: str
    password: str
    rememberMe: Optional[bool] = False

# Location
class DeliveryCheckRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    lat: Optional[float] = None
    lng: Optional[float] = None
