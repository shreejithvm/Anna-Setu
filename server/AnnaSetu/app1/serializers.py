from rest_framework import serializers
from app1.models import (User,ProfileModel,Category,FoodListing,Order,PaymentModel,Review,Wishlist,Conversation,Message,Report,Notification)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email','username', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.get("role")

        #Block admin registration
        if role == "ADMIN":
            raise serializers.ValidationError("Admin cannot register")

        # Create user
        user = User.objects.create_user(**validated_data) # in this line create_user is special django method which makes password hashing
        return user
    
class  ProfileSerializer(serializers.ModelSerializer):
       user=UserSerializer(read_only=True)
       class Meta:
            model=ProfileModel
            fields=['id', 'user','first_name','phone','address','profile_pic']

class CategorySerializer(serializers.ModelSerializer):
     class Meta:
          model=Category
          fields=['id','name','expiry_hours']

class FoodListingSerializer(serializers.ModelSerializer):
      seller_email = serializers.ReadOnlyField(source="seller.email")
      category_name = serializers.ReadOnlyField(source="food_category.name")
      class Meta:
           model=FoodListing
           fields=['id','seller','food_category','expiry_time','title','description','quantity','price','food_image','status','created_at']  
           read_only_fields = ("seller", "status", "created_at")        
     

     
     
# -----------------------------
# Order Serializer
# -----------------------------
class OrderSerializer(serializers.ModelSerializer):

    buyer_email = serializers.ReadOnlyField(source="buyer.email")
    seller_email = serializers.ReadOnlyField(source="seller.email")
    class Meta:
        model = Order
        fields = ["id","food","buyer","buyer_email","seller","seller_email","quantity","total_price","status",]
        read_only_fields = (
            "buyer",
            "seller",
            "total_price",
        )


# -----------------------------
# Payment Serializer
# -----------------------------
class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = PaymentModel
        fields = "__all__"
        read_only_fields = (
            "status",
            "razorpay_payment_id",
            "razorpay_signature",
            "created_at",
        )


# -----------------------------
# Review Serializer
# -----------------------------
class ReviewSerializer(serializers.ModelSerializer):
    reviewer_email = serializers.ReadOnlyField(source="reviewer.email")
    seller_email = serializers.ReadOnlyField(source="seller.email")
    class Meta:
        model = Review
        fields = ["id","food","reviewer","reviewer_email","seller","seller_email","rating","comment","created_at"]
        read_only_fields = ("reviewer","seller","created_at",)


# -----------------------------
# Wishlist Serializer
# -----------------------------
class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = "__all__"
        read_only_fields = ("user")


# -----------------------------
# Conversation Serializer
# -----------------------------
class ConversationSerializer(serializers.ModelSerializer):
    initiated_email = serializers.ReadOnlyField(source="initiated_conversations.email")
    received_email = serializers.ReadOnlyField(source="received_conversations.email")
    class Meta:
        model = Conversation
        fields = ["id","initiated_conversations","initiated_email","received_conversations","received_email","created_at",]
        read_only_fields = ("created_at")


# -----------------------------
# Message Serializer
# -----------------------------
class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source="sender.email")
    class Meta:
        model = Message
        fields = ["id","conversation","sender","sender_email","message","timestamp","is_read",]
        read_only_fields = ("sender","timestamp","is_read",)


# -----------------------------
# Report Serializer
# -----------------------------
class ReportSerializer(serializers.ModelSerializer):
    reporter_email = serializers.ReadOnlyField(source="reporter.email")
    reported_email = serializers.ReadOnlyField(source="reported_user.email")
    class Meta:
        model = Report
        fields = ["id","reporter","reporter_email","reported_user","reported_email","reason","status",]
        read_only_fields = ("reporter","status",)


# -----------------------------
# Notification Serializer
# -----------------------------
class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ("user","created_at",)