console.log("✅ ProductModal.js loaded");

// ==================
// STATE
// ==================
let quantity = 1;
let mood = "cold";
let size = "M";
let sugar = "50%";
let editingId = null;

// ==================
// PRICES
// ==================
const sizePrices = { S: 39, M: 69, L: 99 };

// ==================
// CART (single source of truth)
// ==================
window.cart = window.cart ?? JSON.parse(localStorage.getItem("cart") || "[]");

function getCart() { return window.cart; }
function setCart(next) { window.cart = next; }

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(getCart()));
}

// ==================
// UI HELPERS
// ==================
function setAddButtonLabel(isEdit) {
  const btn = document.getElementById("addToCartBtn");
  if (!btn) return;
  btn.textContent = isEdit ? "Update Item" : "Add to Cart";
}

function setActive(btn, on) {
  if (!btn) return;
  btn.classList.toggle("border-gray-800", on);
  btn.classList.toggle("border-transparent", !on);
}

function paintMood() {
  setActive(document.getElementById("moodHot"), mood === "hot");
  setActive(document.getElementById("moodCold"), mood === "cold");
}

function paintSize() {
  setActive(document.getElementById("sizeS"), size === "S");
  setActive(document.getElementById("sizeM"), size === "M");
  setActive(document.getElementById("sizeL"), size === "L");
}

function paintSugar() {
  setActive(document.getElementById("sugar25"), sugar === "25%");
  setActive(document.getElementById("sugar50"), sugar === "50%");
  setActive(document.getElementById("sugar75"), sugar === "75%");
}

// ==================
// PRODUCT MODAL (OPEN)
// ==================
function openProductModal(name, imgSrc, desc, editItem = null) {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  // clear stale edit flags when opening normally
  if (!editItem) {
    localStorage.removeItem("editReturn");
    editingId = null;
  } else {
    editingId = editItem.id;
  }

  const titleEl = document.getElementById("modalTitle");
  const imageEl = document.getElementById("modalImage");
  const descEl  = document.getElementById("modalDesc");
  const qtyEl   = document.getElementById("qty");
  const priceEl = document.getElementById("modalPrice");

  if (titleEl) titleEl.textContent = (name || "ITEM").toUpperCase();
  if (imageEl) imageEl.src = imgSrc || "";
  if (descEl)  descEl.textContent = desc || "";

  if (editItem) {
    quantity = editItem.qty;
    mood = editItem.mood;
    size = editItem.size;
    sugar = editItem.sugar;
    setAddButtonLabel(true);
  } else {
    quantity = 1;
    mood = "cold";
    size = "M";
    sugar = "50%";
    setAddButtonLabel(false);
  }

  if (qtyEl) qtyEl.textContent = quantity;
  if (priceEl) priceEl.textContent = "₱" + sizePrices[size];

  paintMood();
  paintSize();
  paintSugar();

  document.body.classList.add("overflow-hidden");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// ==================
// PRODUCT MODAL (CLOSE) – FIXED
// ==================
function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  const returnTo = localStorage.getItem("editReturn");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");

  editingId = null;
  setAddButtonLabel(false);

  // If editing from cart, return to cart when closing
  if (returnTo === "cart") {
    localStorage.removeItem("editReturn");
    window.location.href = "/cart/";
  }
}

// ==================
// CANCEL CONFIRM MODAL (MENU PAGE)
// ==================
function openCancelConfirm() {
  const modal = document.getElementById("cancelConfirmModal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.classList.add("overflow-hidden");
}

function closeCancelConfirm() {
  const modal = document.getElementById("cancelConfirmModal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");
}

function confirmCancel() {
  // clears cart, updates UI, closes confirm modal
  setCart([]);
  saveCart();
  localStorage.removeItem("editItem");
  localStorage.removeItem("editReturn");

  renderCart?.();   // menu mini-cart
  closeCancelConfirm();
}

// ==================
// OPTION SETTERS
// ==================
function setMood(v) { mood = v; paintMood(); }

function setSize(v) {
  size = v;
  const priceEl = document.getElementById("modalPrice");
  if (priceEl) priceEl.textContent = "₱" + sizePrices[size];
  paintSize();
}

function setSugar(v) { sugar = v; paintSugar(); }

function changeQty(delta) {
  quantity = Math.max(1, quantity + delta);
  const q = document.getElementById("qty");
  if (q) q.textContent = quantity;
}

// ==================
// ADD / EDIT CART
// ==================
function addToCart() {
  const titleEl = document.getElementById("modalTitle");
  const imageEl = document.getElementById("modalImage");
  const descEl  = document.getElementById("modalDesc");

  const name = (titleEl?.textContent || "").trim();
  const imgSrc = imageEl?.getAttribute("src") || "";
  const desc = (descEl?.textContent || "").trim();
  const price = sizePrices[size];

  const cart = getCart();
  const newId = `${name}|${mood}|${size}|${sugar}`;

  // ===== EDIT MODE =====
  if (editingId) {
    const idx = cart.findIndex(i => i.id === editingId);
    if (idx === -1) return;

    const mergeIdx = cart.findIndex(i => i.id === newId && i.id !== editingId);

    if (mergeIdx !== -1) {
      cart[mergeIdx].qty += quantity;
      cart.splice(idx, 1);
    } else {
      cart[idx] = {
        ...cart[idx],
        id: newId,
        name,
        imgSrc,
        desc,
        mood,
        size,
        sugar,
        qty: quantity,
        price
      };
    }

    setCart(cart);
    saveCart();

    renderCart?.();
    closeProductModal(); // ✅ fixed

    return;
  }

  // ===== ADD MODE =====
  const existing = cart.find(i => i.id === newId);

  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      id: newId,
      name,
      imgSrc,
      desc,
      mood,
      size,
      sugar,
      qty: quantity,
      price
    });
  }

  setCart(cart);
  saveCart();

  renderCart?.();
  closeProductModal(); // ✅ fixed
}

// ==================
// MINI CART RENDER (MENU PAGE)
// ==================
function updateTotals(total) {
  const box = document.getElementById("orderTotalBox");
  if (box) box.textContent = `₱${total.toFixed(2)}`;
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById("orderItemsList");
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = `
      <div class="px-4 py-6 text-center text-sm text-gray-400">
        No items yet
      </div>`;
    updateTotals(0);
    return;
  }

  list.innerHTML = cart.map(item => {
    const sizeText = item.size === "S" ? "Small" : item.size === "M" ? "Medium" : "Large";
    const moodText = item.mood === "hot" ? "Hot" : "Iced";
    const subtitle = `${sizeText} | ${moodText} | ${item.sugar}`;
    const lineTotal = item.price * item.qty;

    return `
      <div class="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
        <div class="flex items-center gap-6">
          <img src="${item.imgSrc}" class="w-16 h-16 object-contain" alt="${item.name}">
          <div>
            <div class="font-extrabold uppercase">${item.name}</div>
            <div class="text-sm text-gray-500">${subtitle}</div>
            <div class="font-bold">x${item.qty}</div>
          </div>
        </div>
        <div class="font-extrabold">₱${lineTotal.toFixed(2)}</div>
      </div>`;
  }).join("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  updateTotals(total);
}

// ==================
// INIT
// ==================
document.addEventListener("DOMContentLoaded", () => {
  // Wire product cards
  document.querySelectorAll(".productBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      openProductModal(btn.dataset.name, btn.dataset.img, btn.dataset.desc);
    });
  });

  // Render mini-cart immediately on page load
  renderCart();

  // Auto-open product modal when editing from cart
  const raw = localStorage.getItem("editItem");
  if (raw) {
    try {
      const item = JSON.parse(raw);
      openProductModal(item.name, item.imgSrc, item.desc, item);
      localStorage.removeItem("editItem");
    } catch {
      localStorage.removeItem("editItem");
    }
  }
});

// ==================
// EXPOSE GLOBALS (for inline onclick)
// ==================
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.setMood = setMood;
window.setSize = setSize;
window.setSugar = setSugar;
window.renderCart = renderCart;

window.openCancelConfirm = openCancelConfirm;
window.closeCancelConfirm = closeCancelConfirm;
window.confirmCancel = confirmCancel;
