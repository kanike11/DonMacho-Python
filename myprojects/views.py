from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from django.views.decorators.csrf import ensure_csrf_cookie
import random


SIZE_PRICES = {"S": 39, "M": 69, "L": 99}

def _get_cart(request):
    return request.session.get("cart", [])

def _set_cart(request, cart):
    request.session["cart"] = cart
    request.session.modified = True

def _total(cart):
    return sum(float(i.get("price", 0)) * int(i.get("qty", 0)) for i in cart)

# =========================
# PAGE RENDER VIEWS
# =========================
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

def order_successful(request):
    order_number = random.randint(10000, 99999)
    return render(request, "DonMacKiosk/OrderSuccessful.html", {
        "order_number": order_number
    })

def order_successful_back(request):
    request.session["cart"] = []
    request.session.modified = True
    return redirect("myprojects:StartingPage")

@ensure_csrf_cookie
def menu(request):
    return render(request, "DonMacKiosk/Menupage.html")

# ✅ UPDATED: pass session cart to template
def cart(request):
    cart_items = _get_cart(request)
    return render(request, "DonMacKiosk/ViewCart.html", {
        "cart_items": cart_items,
        "cart_total": _total(cart_items),
    })

def payment_option(request):
    return render(request, "DonMacKiosk/PaymentOption.html")


# =========================
# CART API (SESSION-BASED)
# =========================
@require_http_methods(["GET"])
def api_cart_get(request):
    cart = _get_cart(request)
    return JsonResponse({"cart": cart, "total": _total(cart)})

@require_http_methods(["POST"])
def api_cart_add_or_edit(request):
    data = json.loads(request.body.decode("utf-8") or "{}")

    name = (data.get("name") or "").strip().upper()
    imgSrc = data.get("imgSrc") or ""
    desc = (data.get("desc") or "").strip()
    mood = data.get("mood") or "cold"
    size = data.get("size") or "M"
    sugar = data.get("sugar") or "50%"
    qty = max(1, int(data.get("qty") or 1))
    editing_id = data.get("editingId")

    if size not in SIZE_PRICES:
        return JsonResponse({"error": "Invalid size"}, status=400)

    price = SIZE_PRICES[size]
    new_id = f"{name}|{mood}|{size}|{sugar}"

    cart = _get_cart(request)

    if editing_id:
        idx = next((i for i, it in enumerate(cart) if it.get("id") == editing_id), -1)
        if idx == -1:
            return JsonResponse({"error": "Item not found"}, status=404)

        merge_idx = next((i for i, it in enumerate(cart)
                          if it.get("id") == new_id and it.get("id") != editing_id), -1)

        if merge_idx != -1:
            cart[merge_idx]["qty"] = int(cart[merge_idx].get("qty", 0)) + qty
            cart.pop(idx)
        else:
            cart[idx] = {
                **cart[idx],
                "id": new_id,
                "name": name,
                "imgSrc": imgSrc,
                "desc": desc,
                "mood": mood,
                "size": size,
                "sugar": sugar,
                "qty": qty,
                "price": price,
            }
    else:
        existing = next((it for it in cart if it.get("id") == new_id), None)
        if existing:
            existing["qty"] = int(existing.get("qty", 0)) + qty
        else:
            cart.append({
                "id": new_id,
                "name": name,
                "imgSrc": imgSrc,
                "desc": desc,
                "mood": mood,
                "size": size,
                "sugar": sugar,
                "qty": qty,
                "price": price,
            })

    _set_cart(request, cart)
    return JsonResponse({"cart": cart, "total": _total(cart)})

@require_http_methods(["POST"])
def api_cart_remove(request):
    data = json.loads(request.body.decode("utf-8") or "{}")
    item_id = data.get("id")
    cart = [it for it in _get_cart(request) if it.get("id") != item_id]
    _set_cart(request, cart)
    return JsonResponse({"cart": cart, "total": _total(cart)})

@require_http_methods(["POST"])
def api_cart_clear(request):
    _set_cart(request, [])
    return JsonResponse({"cart": [], "total": 0.0})
