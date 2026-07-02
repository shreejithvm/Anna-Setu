from django.shortcuts import render
from app1.models import (User,ProfileModel,Category,FoodListing,Order,PaymentModel,Review,Wishlist,Conversation,Message,Report,Notification,)
from serializers import (UserSerializer,ProfileSerializer,CategorySerializer,FoodListingSerializer,OrderSerializer,PaymentSerializer,ReviewSerializer,WishlistSerializer,ConversationSerializer,MessageSerializer,ReportSerializer,NotificationSerializer)
from rest_framework import viewsets , permissions
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
# Create your views here.

class UserView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]   # <-- Use JWT here
    permission_classes = [permissions.IsAdminUser] # Only admins can access

    @action(detail=False, methods=["GET"], permission_classes=[permissions.IsAdminUser])
    def get_users(self, request):
        users = User.objects.filter(role="USER")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)