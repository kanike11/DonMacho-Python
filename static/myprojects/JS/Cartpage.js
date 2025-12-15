console.log("✅ CartPage.js loaded");

window.cart = window.cart ?? JSON.parse(localStorage.getItem("cart") || "[]");

function getCart() { return window.cart; }
function setCart(next) { window.cart = next; }

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(getCart()));
}

function peso(n) {
  return `₱${Number(n).toFixed(2)}`;
}

function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartTotalText = document.getElementById("cartTotalText");
  const cart = getCart();

  if (!cartItems || !cartTotalText) return;

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="px-4 py-10 text-center text-sm text-gray-400">
        No items yet
      </div>
    `;
    cartTotalText.textContent = "₱0.00";
    return;
  }

  cartItems.innerHTML = cart.map(item => {
    const sizeText = item.size === "S" ? "Small" : item.size === "M" ? "Medium" : "Large";
    const moodText = item.mood === "hot" ? "Hot" : "Iced";
    const subtitle = `${sizeText} | ${moodText} | ${item.sugar}`;
    const lineTotal = item.price * item.qty;

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

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  cartTotalText.textContent = peso(total);
}

function removeCartItem(id) {
  const next = getCart().filter(item => item.id !== id);
  setCart(next);
  saveCart();
  renderCartPage();
}

function editCartItem(id) {
  const item = getCart().find(i => i.id === id);
  if (!item) return;

  localStorage.setItem("editItem", JSON.stringify(item));
  localStorage.setItem("editReturn", "cart");
  window.location.href = "/menu/";

}

function clearCartPage() {
  setCart([]);
  saveCart();
  localStorage.removeItem("editItem");
  localStorage.removeItem("editReturn");
  renderCartPage();
}

function updateCartCheckoutBtn(cart) {
  const btn = document.getElementById("cartCheckoutBtn");
  if (!btn) return;

  const hasItems = cart && cart.length > 0;

  btn.disabled = !hasItems;
  btn.className = hasItems
    ? "h-14 w-full rounded-2xl bg-black text-white font-semibold tracking-wide shadow hover:bg-white hover:text-black hover:border hover:border-black transition"
    : "h-14 w-full rounded-2xl bg-gray-200 text-gray-400 font-semibold tracking-wide cursor-not-allowed";
}


renderCartPage();

// expose for inline onclick if needed
window.editCartItem = editCartItem;
window.removeCartItem = removeCartItem;
window.clearCartPage = clearCartPage;
