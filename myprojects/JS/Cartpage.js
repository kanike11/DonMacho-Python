console.log("✅ CartPage.js loaded");

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function peso(n) {
  return `₱${Number(n).toFixed(2)}`;
}

function renderCartPage() {
  const cartItems = document.getElementById("cartItems");
  const cartTotalText = document.getElementById("cartTotalText");

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

          <!-- ✅ EDIT -->
          <button
            type="button"
            onclick="editCartItem('${item.id}')"
            class="h-10 px-4 rounded-xl bg-gray-100 font-bold hover:bg-gray-200"
          >
            Edit
          </button>

          <!-- ✅ DELETE -->
          <button
            type="button"
            onclick="removeCartItem('${item.id}')"
            class="h-10 px-4 rounded-xl bg-black text-white font-bold
                   hover:bg-white hover:text-black hover:border hover:border-black transition"
          >
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
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCartPage();
}

function editCartItem(id) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  // ✅ store item to edit so Menupage.html can open the modal with this item
  localStorage.setItem("editItem", JSON.stringify(item));

  // ✅ go back to menu page
  window.location.href = "/menu/";

}

function clearCartPage() {
  cart = [];
  saveCart();
  localStorage.removeItem("editItem");
  renderCartPage();
}

// render on load
renderCartPage();
