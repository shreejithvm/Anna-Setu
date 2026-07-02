from django.shortcuts import render
from app1.models import (User,ProfileModel,Category,FoodListing,Order,PaymentModel,Review,Wishlist,Conversation,Message,Report,Notification,)
from serializers import (UserSerializer,ProfileSerializer,CategorySerializer,FoodListingSerializer,OrderSerializer,PaymentSerializer,ReviewSerializer,WishlistSerializer,ConversationSerializer,MessageSerializer,ReportSerializer,NotificationSerializer)
from rest_framework import viewsets

# Create your views here.

# class UserView(viewsets.ModelViewSet):
#     queryset=