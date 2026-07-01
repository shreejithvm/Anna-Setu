from django.db import models
from django.contrib.auth.models import AbstractUser

from django.core.validators import MinValueValidator, MaxValueValidator
# Create your models here.

class User(AbstractUser):
    ROLE_CHOICES=(
        ('ADMIN','Admin'), # Here First value "ADMIN" is stored in backend database and the "Admin" is a display name shoes in front end
        ('USER','User'),
    )
    
    email=models.EmailField(unique=True)
    role=models.CharField(max_length=10, choices=ROLE_CHOICES, default="USER")

    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['username']

    def __str__(self):
        return f"{self.email}"

class ProfileModel(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)   
    first_name=models.CharField(max_length=30,blank=True)
    phone=models.CharField(max_length=15,blank=True)
    address = models.TextField(max_length=100,blank=True)
    profile_pic=models.ImageField(upload_to="profiles/",default="profiles/default.png")

    def __str__(self):
        return self.user.email
    

class Category(models.Model):
    CATEGORY_OPTIONS = (
        ("MEAL", "Meal"),
        ("SNACK", "Snack"),
        ("BEVERAGE", "Beverage"),
        ("FRUIT", "Fruit"),
        ("VEGETABLE", "Vegetable"),
        ("DAIRY", "Dairy"),
        ("GRAIN", "Grain"),
        ("DESSERT", "Dessert"),
    )

    name = models.CharField(
        max_length=100,
        choices=CATEGORY_OPTIONS,
        unique=True
    )

    # Number of hours food in this category stays valid
    expiry_hours = models.PositiveIntegerField()

    def __str__(self):
        return self.get_name_display()


class FoodListing(models.Model):
    seller=models.ForeignKey(User, on_delete=models.CASCADE)
    food_category = models.ForeignKey(Category, on_delete=models.CASCADE)
    expiry_time = models.DateTimeField()
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(max_length=200, blank=True, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2,validators=[MinValueValidator(0)])
    food_image = models.ImageField(upload_to="foods/", blank=True,null=True)
    status = models.CharField(max_length=20,choices=[
            ("AVAILABLE", "Available"),
            ("SOLD", "Sold"),
            ("EXPIRED", "Expired"),
        ],
        default="AVAILABLE")

    created_at = models.DateTimeField(auto_now_add=True)   

    def __str__(self):
        return f"{self.seller.username} - {self.food_category.name} - {self.expiry_time}" 


class Order(models.Model):
    food = models.ForeignKey(FoodListing, on_delete=models.CASCADE)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE)
    seller = models.ForeignKey(User, related_name="sales",on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("ACCEPTED", "Accepted"),
            ("COMPLETED", "Completed"),
            ("CANCELLED", "Cancelled"),
        ],
    default="PENDING")

    def __str__(self):
        return f"{self.food}-{self.total_price}"
    
class PaymentModel(models.Model):
    PAYMENT_STATUS = (
        ("CREATED", "Created"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    )

    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10,choices=PAYMENT_STATUS, default="CREATED")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.id} - {self.status}" 




class Review(models.Model):
    food = models.ForeignKey(FoodListing, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    seller = models.ForeignKey(
        User,
        related_name="seller_reviews",
        on_delete=models.CASCADE
    )

    rating=models.PositiveSmallIntegerField(
    validators=[
        MinValueValidator(1),
        MaxValueValidator(5)
    ])
    
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.food}- {self.reviewer}-to-{self.seller}"

class Wishlist(models.Model):
    user= models.ForeignKey(User, on_delete=models.CASCADE)
    food = models.ForeignKey(FoodListing, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}-{self.food}"


class Conversation(models.Model):
    initiated_conversations = models.ForeignKey(
        User,
        related_name="user1",
        on_delete=models.CASCADE )

    received_conversations = models.ForeignKey(
        User,
        related_name="user2",
        on_delete=models.CASCADE )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.initiated_conversations}-to-{self.received_conversations}"

class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.conversation}"



class Report(models.Model):
    reporter = models.ForeignKey(User,related_name="reporter",on_delete=models.CASCADE)
    reported_user = models.ForeignKey(User,related_name="reported",on_delete=models.CASCADE )
    reason = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING", "Pending"),
            ("RESOLVED", "Resolved"),
        ]
    )   

    def __init__(self, *args, **kwargs):
        return f"{self.reporter} -> {self.reported_user}" 

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.CharField(max_length=300)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __init__(self, *args, **kwargs):
        return f"{self.user.username}"
   