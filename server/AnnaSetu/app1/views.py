from django.shortcuts import render
from app1.models import (User,ProfileModel,Category,FoodListing,Order,PaymentModel,Review,Wishlist,Conversation,Message,Report,Notification,)
from app1.serializers import (UserSerializer,ProfileSerializer,CategorySerializer,FoodListingSerializer,OrderSerializer,PaymentSerializer,ReviewSerializer,WishlistSerializer,ConversationSerializer,MessageSerializer,ReportSerializer,NotificationSerializer)
from rest_framework import viewsets , permissions,generics
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAdminUser

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class LoginSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Optional: Add custom claims inside the JWT
        token["username"] = user.username
        token["role"] = user.role

        return token

    def validate(self, attrs): 
        data = super().validate(attrs)

        # Add extra response data
        data["user_id"] = self.user.id
        data["username"] = self.user.username
        data["email"] = self.user.email
        data["role"] = self.user.role
        data["is_staff"] = self.user.is_staff
        data["is_superuser"] = self.user.is_superuser

        return data


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class UserView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permission(self):
        if self.action=='create':
            return[AllowAny]
        return[permissions.IsAdminUser]
    

    @action(detail=False, methods=["GET"], permission_classes=[permissions.IsAdminUser])
    def get_users(self, request):
        users = User.objects.filter(role="USER")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)