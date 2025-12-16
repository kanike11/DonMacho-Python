console.log("✅ Cartpage.js loaded (Django session cart)");

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

async function api(url, options = {}) {
  const csrftoken = getCookie("csrftoken");
  const res = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(csrftoken ? { "X-CSRFToken": csrftoken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function peso(n) {
  return `₱${Number(n).toFixed(2)}`;
}

function updateCartCheckoutBtn(cart) {
  const btn = document.getElementById("cartCheckoutBtn");
  if (!btn) return;

  const hasItems = cart && cart.length > 0;
  btn.disabled = !hasItems;

  btn.className = hasItems
    ? "h-12 px-8 rounded-2xl bg-black text-white font-semibold shadow transition-all duration-200 hover:bg-white hover:text-black hover:border hover:border-black"
    : "h-12 px-8 rounded-2xl bg-gray-200 text-gray-400 font-semibold shadow cursor-not-allowed";
}

async function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartTotalText = document.getElementById("cartTotalText");
  if (!cartItems || !cartTotalText) return;

  let data;
  try {
    data = await api(window.CART_API.get, { method: "GET" });
  } catch (e) {
    console.error("❌ Failed loading cart:", e);
    cartItems.innerHTML = `
      <div class="px-4 py-10 text-center text-sm text-gray-400">
        Failed to load cart
      </div>`;
    cartTotalText.textContent = "₱0.00";
    updateCartCheckoutBtn([]);
    return;
  }

  const cart = data.cart || [];
  console.log("🛒 Cart data from server:", cart); // ✅ DEBUG

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="px-4 py-10 text-center text-sm text-gray-400">
        No items yet
      </div>`;
    cartTotalText.textContent = "₱0.00";
    updateCartCheckoutBtn(cart);
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const sizeText = item.size === "S" ? "Small" : item.size === "M" ? "Medium" : "Large";
    const moodText = item.mood === "hot" ? "Hot" : "Iced";
    const subtitle = `${sizeText} | ${moodText} | ${item.sugar}`;
    const lineTotal = Number(item.price) * Number(item.qty);

    return `
      <div class="flex items-center justify-between px-6 py-5 bg-white border-b">
        <div class="flex items-center gap-5">
          <div class="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src="${item.imgSrc}" class="w-16 h-16 object-contain" alt="${item.name}">
          </div>

          <div class="leading-tight">
            <div class="text-base font-extrabold uppercase">${item.name}</div>
            <div class="mt-1 text-xs text-gray-400">${subtitle}</div>
            <div class="mt-2 text-sm font-bold">x${item.qty}</div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-sm font-extrabold text-gray-800 whitespace-nowrap">
            ${peso(lineTotal)}
          </div>

          <button type="button"
            onclick="editCartItem('${item.id}')"
            class="h-10 px-4 rounded-xl bg-gray-100 font-bold hover:bg-gray-200">
            Edit
          </button>

          <button type="button"
            onclick="removeCartItem('${item.id}')"
            class="h-10 px-4 rounded-xl bg-black text-white font-bold
                   hover:bg-white hover:text-black hover:border hover:border-black transition">
            Delete
          </button>
        </div>
      </div>
    `;
  }).join("");

  cartTotalText.textContent = peso(data.total || 0);
  updateCartCheckoutBtn(cart);
}

async function removeCartItem(id) {
  try {
    await api(window.CART_API.remove, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    await renderCartPage();
  } catch (e) {
    console.error(e);
  }
}

function editCartItem(id) {
  window.location.href = `/menu/?edit=${encodeURIComponent(id)}&return=cart`;
}

async function clearCartPage() {
  try {
    await api(window.CART_API.clear, {
      method: "POST",
      body: JSON.stringify({}),
    });
    await renderCartPage();
  } catch (e) {
    console.error(e);
  }
}

renderCartPage();

window.editCartItem = editCartItem;
window.removeCartItem = removeCartItem;
window.clearCartPage = clearCartPage;
