from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field, EmailStr, ConfigDict

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )

class NutritionInfo(BaseModel):
    calories: str = "410 kcal"
    protein: str = "24g"
    carbs: str = "38g"
    fat: str = "14g"
    fiber: str = "11g"
    sodium: str = "280mg"
    vitamins: str = "A, C, K, B-Complex"

class SaladAddOn(BaseModel):
    name: str
    price: float = 40.0

class SaladBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    slug: Optional[str] = None
    tag: str = "Chef Choice"
    price: str = "₹299"
    originalPrice: Optional[str] = "₹349"
    description: str = ""
    calories: str = "410 kcal"
    protein: str = "24g"
    carbs: str = "38g"
    fat: str = "14g"
    image: str
    rating: float = 4.9
    reviews: int = 142
    prepTime: str = "10-15 mins"
    isAvailable: bool = True
    isVegetarian: bool = True
    isVegan: bool = False
    isGlutenFree: bool = True
    ingredients: List[str] = Field(default_factory=list)
    healthBenefits: List[str] = Field(default_factory=list)
    nutrition: Optional[NutritionInfo] = None
    dressing: Optional[str] = "100% Freeze-Dried Cold-Blended Dressing"
    addOns: Optional[List[SaladAddOn]] = Field(default_factory=list)

class SaladCreate(SaladBase):
    pass

class SaladUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: Optional[str] = None
    slug: Optional[str] = None
    tag: Optional[str] = None
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
    healthBenefits: Optional[List[str]] = None
    nutrition: Optional[NutritionInfo] = None
    dressing: Optional[str] = None
    addOns: Optional[List[SaladAddOn]] = None

class SaladInDB(SaladBase):
    id: str = Field(alias="_id")
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)

# Cart and Orders
class CartItemSchema(BaseModel):
    id: str
    name: str
    price: str
    image: str
    quantity: int = 1
    selectedAddOns: Optional[List[SaladAddOn]] = None

class OrderCreate(BaseModel):
    id: Optional[str] = None
    orderNumber: Optional[str] = None
    customerName: str
    customerEmail: Optional[str] = "customer@greesal.in"
    customerMobile: str
    deliveryAddress: str
    deliveryNote: Optional[str] = None
    items: List[CartItemSchema]
    subtotal: float
    deliveryFee: float = 0.0
    total: float
    paymentMethod: str = "Cash on Delivery / UPI on Delivery"
    status: str = "Preparing"

class OrderStatusUpdate(BaseModel):
    status: str

class OrderInDB(OrderCreate):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    date: str = Field(default_factory=lambda: datetime.now().strftime("Today, %I:%M %p"))
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    created_at: datetime = Field(default_factory=get_utc_now)

# Users
class UserCreate(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    image: Optional[str] = None
    google_id: Optional[str] = None
    mobile: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    mobile: Optional[str] = None

class UserInDB(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

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
    mobile: str

class OTPVerifyRequest(BaseModel):
    mobile: str
    otp: str
    name: Optional[str] = None

class AdminLoginRequest(BaseModel):
    username: str
    password: str

# Store Settings
class StoreSettings(BaseModel):
    title: Optional[str] = "Farm-Fresh Organic Salad Bowls"
    description: Optional[str] = "Handcrafted clean nutrition made with 100% pesticide-free greens, organic protein, and freeze-dried superfoods. Delivered fresh across Surat in 30 mins."
    badgeText: Optional[str] = "100% Certified Organic • Hydroponic Greens"
    heroImage: Optional[str] = "/images/salad_bowl_hero.jpg"
    featuredSaladName: Optional[str] = "High Protein Power Bowl"
    featuredSaladTag: Optional[str] = "Signature Salad"
    pill1Text: Optional[str] = "19g Plant Protein"
    pill2Text: Optional[str] = "Freeze-Dried Freshness"
    highlight1Title: Optional[str] = "30-Min Fast Delivery"
    highlight1Subtitle: Optional[str] = "Express in Surat"
    highlight2Title: Optional[str] = "Zero Chemicals"
    highlight2Subtitle: Optional[str] = "100% Certified Organic"
    highlight3Title: Optional[str] = "4.9 / 5 Rating"
    highlight3Subtitle: Optional[str] = "Surat Health Lovers"
    ctaText: Optional[str] = "Browse Fresh Bowls"
    ctaLink: Optional[str] = "#menu"
    isOpen: bool = True
    notice: str = "Fresh Organic Harvest Delivered in 30 Mins across Surat"
    deliveryFee: int = 0
    freeDeliveryThreshold: int = 499
    openingTime: str = "08:00 AM"
    closingTime: str = "10:30 PM"
    contactPhone: str = "+91 98251 44321"
    contactEmail: str = "contact@greesal.in"
    address: str = "Katargam & Vesu, Surat, Gujarat 395004"

class HealthResponse(BaseModel):
    status: str
    mongodb_connected: bool
    database_name: str
    timestamp: datetime = Field(default_factory=get_utc_now)
