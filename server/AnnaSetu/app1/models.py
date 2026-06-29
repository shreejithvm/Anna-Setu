from django.db import models
from django.contrib.auth.models import AbstractUser
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
    phone=models.CharField(max_length=15,blank=True)
    address = models.TextField(max_length=100,blank=True)
    profile_pic=models.ImageField(upload_to="profiles/",blank=True)

    def __str__(self):
        return self.user.email
    

class Category(models.Model):
    CATEGORY_OPTIONS=(
    ("MEAL", "Meal"),
    ("SNACK", "Snack"),
    ("BEVERAGE", "Beverage"),
    ("FRUIT", "Fruit"),
    ("VEGETABLE", "Vegetable"),
    ("DAIRY", "Dairy"),
    ("GRAIN", "Grain"),
    ("DESSERT", "Dessert"),
)
    name = models.CharField(max_length=100,choices=CATEGORY_OPTIONS, default="MEAL")    


class FoodListing(models.Model):
    seller=models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(max_length=200, blank=True, null=True)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to="foods/")
    expiry_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=[
            ("AVAILABLE", "Available"),
            ("SOLD", "Sold"),
            ("EXPIRED", "Expired"),
        ],
        default="AVAILABLE"
    )

    created_at = models.DateTimeField(auto_now_add=True)    