from django.shortcuts import render
from app1.models import (User,ProfileModel,Category,FoodListing,Order,PaymentModel,Review,Wishlist,Conversation,Message,Report,Notification,)
from app1.serializers import (UserSerializer,ProfileSerializer,CategorySerializer,FoodListingSerializer,OrderSerializer,PaymentSerializer,ReviewSerializer,WishlistSerializer,ConversationSerializer,MessageSerializer,ReportSerializer,NotificationSerializer)
from rest_framework import viewsets ,permissions,generics
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
from rest_framework.decorators import action
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAdminUser

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes

# Create your views here.

# to find username and email.. details who logged

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getdata(request, *args, **kwargs):

    user = request.user

    return Response({
        "id": user.id,
        "username": user.username,
        "email":user.email
    })

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



class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({
                "message": "Logout successful"
            })

        except Exception:
            return Response({
                "error": "Invalid refresh token"
            }, status=400)    


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



class FoodListingView(viewsets.ModelViewSet):
    queryset = FoodListing.objects.all()
    serializer_class=FoodListingSerializer 
    authentication_classes = []   
    permission_classes = [AllowAny] 
    parser_classes = [MultiPartParser, FormParser]
    

class FoodOrderView(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class=OrderSerializer
    authentication_classes = []   
    permission_classes = [AllowAny] 
    parser_classes = [JSONParser,MultiPartParser, FormParser]
    

    
