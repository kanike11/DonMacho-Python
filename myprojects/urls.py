from django.urls import path
from . import views

app_name = "myprojects"

urlpatterns = [
    path("", views.starting_page, name="StartingPage"),
    path("order-type/", views.order_type, name="order_type"),
    path("dine-in/", views.dinein, name="dinein"),
    path("take-out/", views.takeout, name="takeout"),
    path("menu/", views.menu, name="menu"),
    path("cart/", views.cart, name="cart"),
    path("payment-option/", views.payment_option, name="payment_option"),
    path("order-successful/", views.order_successful, name="order_successful"),
    path("order-successful/back/", views.order_successful_back, name="order_successful_back"),



    # ✅ CART API
    path("api/cart/", views.api_cart_get, name="cart_get"),
    path("api/cart/add/", views.api_cart_add_or_edit, name="cart_add_or_edit"),
    path("api/cart/remove/", views.api_cart_remove, name="cart_remove"),
    path("api/cart/clear/", views.api_cart_clear, name="cart_clear"),
]
