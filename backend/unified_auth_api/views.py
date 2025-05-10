from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class UnifiedLoginView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"detail": "Email and password required."}, status=400)

        if email == settings.ADMIN_EMAIL and password == settings.ADMIN_PASSWORD:
            refresh = RefreshToken()
            refresh["email"] = email
            refresh["role"] = "admin"
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": "admin"
            })

        user = authenticate(request, username=email, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            refresh["email"] = user.email
            refresh["role"] = "user"
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": "user"
            })

        return Response({"detail": "Invalid credentials."}, status=401)
