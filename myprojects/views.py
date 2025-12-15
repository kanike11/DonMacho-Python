# myprojects/views.py
from django.shortcuts import render

def starting_page(request):
    return render(request, "DonMacKiosk/StartingPage.html")

def order_type(request):
    return render(request, "DonMacKiosk/OrderType.html")

def dinein(request):
    return render(request, "DonMacKiosk/Menupage.html")

def takeout(request):
    return render(request, "DonMacKiosk/Menupage.html")

def menu(request):
    return render(request, "DonMacKiosk/Menupage.html")

def cart(request):
    return render(request, "DonMacKiosk/ViewCart.html")

def payment_option(request):
    return render(request, "DonMacKiosk/PaymentOption.html")
