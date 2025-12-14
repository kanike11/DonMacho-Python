from django.urls import path
from . import views

app_name = "myprojects"

urlpatterns = [
    path("", views.starting_page, name="StartingPage"),
    path("order-type/", views.order_type, name="order_type"),
    path("dine-in/", views.dinein, name="dinein"),
    path("take-out/", views.takeout, name="takeout"),
    path("menu/", views.menu, name="menu"),
]
