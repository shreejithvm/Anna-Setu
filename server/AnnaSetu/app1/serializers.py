from rest_framework import serializers
from app1.models import (User)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.get("role")

        #Block admin registration
        if role == "ADMIN":
            raise serializers.ValidationError("Admin cannot register")

        # Create user
        user = User.objects.create_user(**validated_data)
        user.save()

        return user