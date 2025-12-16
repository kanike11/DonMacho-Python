console.log("✅ ProductModal.js loaded (SESSION CART via API)");

let quantity = 1;
let mood = "cold";
let size = "M";
let sugar = "50%";          // ✅ default
let editingId = null;
let editReturn = null;      // ✅ where to go after updating

const sizePrices = { S: 39, M: 69, L: 99 };

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
  if (!res.ok) {
    console.error("API error:", data);
    throw new Error(data.error || "Request failed");
  }
  return data;
}

// ==================
// UI helpers
// ==================
function setAddButtonLabel(isEdit) {
  const btn = document.getElementById("addToCartBtn");
  if (btn) btn.textContent = isEdit ? "Update Item" : "Add to Cart";
}

function setActive(btn, on) {
  if (!btn) return;
  btn.classList.toggle("border-gray-800", on);
  btn.classList.toggle("border-transparent", !on);
}

function paintMood() {
  const hot = document.getElementById("moodHot");
  const cold = document.getElementById("moodCold");

  // reset
  hot.style.backgroundColor = "#e9e9e9";
  cold.style.backgroundColor = "#e9e9e9";
  setActive(hot, false);
  setActive(cold, false);

  if (mood === "hot") {
    hot.style.backgroundColor = "rgba(255, 0, 0, 0.25)";
    setActive(hot, true);
  }

  if (mood === "cold") {
    cold.style.backgroundColor = "rgba(0, 120, 255, 0.25)";
    setActive(cold, true);
  }
}

function setMood(v) {
  mood = v;
  paintMood();
}


function paintSize() {
  ["S", "M", "L"].forEach(v => {
    const btn = document.getElementById("size" + v);
    if (!btn) return;

    const circle = btn.querySelector("div");

    // reset
    circle.style.backgroundColor = "#e0e0e0";
    circle.style.color = "#000";
  });

  const activeBtn = document.getElementById("size" + size);
  if (!activeBtn) return;

  const activeCircle = activeBtn.querySelector("div");
  activeCircle.style.backgroundColor = "#000";
  activeCircle.style.color = "#fff";
}

function setSize(v) {
  size = v;

  const priceEl = document.getElementById("modalPrice");
  if (priceEl) priceEl.textContent = "₱" + sizePrices[size];

  paintSize();
}


function paintSugar() {
  document.querySelectorAll(".sugarBtn").forEach(btn => {
    btn.style.backgroundColor = "#e9e9e9";
    setActive(btn, false);
  });

  if (!sugar) return;

  const btn = document.getElementById(
    "sugar" + sugar.replace("%", "")
  );
  if (!btn) return;

  btn.style.backgroundColor = `rgba(${btn.dataset.color}, 0.25)`;
  setActive(btn, true);
}

function setSugar(v) {
  sugar = v;
  paintSugar();
}


// ==================
// Options setters
// ==================
function setMood(v) {
  mood = v;
  paintMood();
}

function setSize(v) {
  size = v;
  const priceEl = document.getElementById("modalPrice");
  if (priceEl) priceEl.textContent = "₱" + sizePrices[size];
  paintSize();
}

// ✅ ONE sugar function only
function setSugar(v) {
  sugar = v;
  paintSugar();
}

function changeQty(delta) {
  quantity = Math.max(1, quantity + delta);
  const q = document.getElementById("qty");
  if (q) q.textContent = quantity;
}

// ==================
// Modal open/close
// ==================
function openProductModal(name, imgSrc, desc, editItem = null) {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  const titleEl = document.getElementById("modalTitle");
  const imageEl = document.getElementById("modalImage");
  const descEl = document.getElementById("modalDesc");
  const qtyEl = document.getElementById("qty");
  const priceEl = document.getElementById("modalPrice");

  if (titleEl) titleEl.textContent = (name || "ITEM").toUpperCase();
  if (imageEl) imageEl.src = imgSrc || "";
  if (descEl) descEl.textContent = desc || "";

  if (editItem) {
    editingId = editItem.id;
    quantity = Number(editItem.qty || 1);
    mood = editItem.mood || "cold";
    size = editItem.size || "M";
    sugar = editItem.sugar || "50%";
    setAddButtonLabel(true);
  } else {
    editingId = null;
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

function closeProductModal() {
  const modal = document.getElementById("productModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
  document.body.classList.remove("overflow-hidden");

  editingId = null;
  setAddButtonLabel(false);
}

// ==================
// ✅ Add/update item via Django session API
// ==================
async function addToCart() {
  const titleEl = document.getElementById("modalTitle");
  const imageEl = document.getElementById("modalImage");
  const descEl = document.getElementById("modalDesc");

  const name = (titleEl?.textContent || "").trim();
  const imgSrc = imageEl?.getAttribute("src") || "";
  const desc = (descEl?.textContent || "").trim();

  await api(window.CART_API.add, {
    method: "POST",
    body: JSON.stringify({
      name,
      imgSrc,
      desc,
      mood,
      size,
      sugar,
      qty: quantity,
      editingId, // if exists -> edit mode on backend
    }),
  });

  await renderCart(); // refresh mini cart

  // ✅ If we came from ViewCart edit, go back to cart after update
  if (editingId && editReturn === "cart") {
    window.location.href = "/cart/";
    return;
  }

  closeProductModal();
}

// ==================
// Mini cart render (menu page)
// ==================
function updateTotals(total) {
  const box = document.getElementById("orderTotalBox");
  if (box) box.textContent = `₱${Number(total || 0).toFixed(2)}`;
}

function updateCheckoutButton(cart) {
  const btn = document.getElementById("cartCheckoutBtn");
  if (!btn) return;

  const hasItems = cart && cart.length > 0;
  btn.disabled = !hasItems;

  btn.className = hasItems
    ? "h-12 px-8 rounded-2xl bg-black text-white font-semibold shadow transition-all duration-200 hover:bg-white hover:text-black hover:border hover:border-black"
    : "h-12 px-8 rounded-2xl bg-gray-300 text-gray-500 font-semibold shadow cursor-not-allowed";
}

async function renderCart() {
  const list = document.getElementById("orderItemsList");
  if (!list) return;

  const data = await api(window.CART_API.get, { method: "GET" });
  const cart = data.cart || [];

  updateCheckoutButton(cart);

  if (!cart.length) {
    list.innerHTML = `
      <div class="px-4 py-6 text-center text-sm text-gray-400">
        No items yet
      </div>`;
    updateTotals(0);
    return;
  }

  list.innerHTML = cart
    .map((item) => {
      const sizeText =
        item.size === "S" ? "Small" : item.size === "M" ? "Medium" : "Large";
      const moodText = item.mood === "hot" ? "Hot" : "Iced";
      const subtitle = `${sizeText} | ${moodText} | ${item.sugar}`;
      const lineTotal = Number(item.price) * Number(item.qty);

      return `
      <div class="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
        <div class="flex items-center gap-6">
          <img src="${item.imgSrc}" class="w-16 h-16 object-contain" />
          <div>
            <div class="font-extrabold uppercase">${item.name}</div>
            <div class="text-sm text-gray-500">${subtitle}</div>
            <div class="font-bold">x${item.qty}</div>
          </div>
        </div>
        <div class="font-extrabold">₱${lineTotal.toFixed(2)}</div>
      </div>`;
    })
    .join("");

  updateTotals(data.total || 0);
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

// Clear cart via Django session API then refresh mini-cart
async function confirmCancel() {
  try {
    await api(window.CART_API.clear, {
      method: "POST",
      body: JSON.stringify({}),
    });

    await renderCart();
    closeCancelConfirm();
  } catch (e) {
    console.error("❌ Failed to clear cart:", e);
  }
}

// ==================
// ✅ EDIT FROM VIEWCART -> MENU MODAL
// ==================
async function openEditorFromQueryString() {
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  editReturn = params.get("return"); // ✅ store return target

  if (!editId) return;

  try {
    const data = await api(window.CART_API.get, { method: "GET" });
    const item = (data.cart || []).find((i) => i.id === editId);
    if (!item) return;

    openProductModal(item.name, item.imgSrc, item.desc, item);

    // Optional: remove query so refresh doesn't re-open modal
    window.history.replaceState({}, document.title, window.location.pathname);
  } catch (e) {
    console.error("❌ Failed to open edit modal:", e);
  }
}

// ==================
// Init
// ==================
document.addEventListener("DOMContentLoaded", async () => {
  document.querySelectorAll(".productBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      openProductModal(btn.dataset.name, btn.dataset.img, btn.dataset.desc);
    });
  });

  await renderCart();

  // ✅ If coming from ViewCart "Edit", auto-open modal
  await openEditorFromQueryString();
});

// Expose (for inline onclick)
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
