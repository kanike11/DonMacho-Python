console.log("✅ ProductModal.js loaded");
window.addToCart = addToCart;

console.log("✅ ProductModal.js loaded");

// state (MUST exist)
let quantity = 1;
let mood = "cold";
let size = "M";
let sugar = "50%";

// prices (MUST exist)
const sizePrices = { S: 39, M: 69, L: 99 };

let editingId = null;

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}


function openProductModal(name, imgSrc, desc, editItem = null) {
    const modal = document.getElementById("productModal"); // ✅ add this

    editingId = editItem ? editItem.id : null;

    document.getElementById("modalTitle").textContent = (name || "ITEM").toUpperCase();
    document.getElementById("modalImage").src = imgSrc || "/static/myprojects/images/Caramelmachiatos.svg";
    document.getElementById("modalDesc").innerHTML = (desc || "").replace(/\n/g, "<br>");

    if (editItem) {
        quantity = editItem.qty;
        mood = editItem.mood;
        size = editItem.size;
        sugar = editItem.sugar;
    } else {
        quantity = 1;
        mood = "cold";
        size = "M";
        sugar = "50%";
    }

    document.getElementById("qty").textContent = quantity;
    document.getElementById("modalPrice").textContent = "₱" + sizePrices[size];

    paintMood();
    paintSize();
    paintSugar();

    document.body.classList.add("overflow-hidden");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}




function closeProductModal() {
    const modal = document.getElementById("productModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden"); // ✅ allow scroll again
}

function changeQty(amount) {
    quantity = Math.max(1, quantity + amount);
    document.getElementById("qty").textContent = quantity;
}

function setMood(v) {
    mood = v;
    paintMood();
}

function setSize(v) {
    size = v;
    document.getElementById("modalPrice").textContent = "₱" + sizePrices[size];
    paintSize();
}

function setSugar(v) {
    sugar = v;
    paintSugar();
}

// active outline like screenshot
function setActive(btn, on) {
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
// CART STORAGE

// each item: { id, name, imgSrc, desc, mood, size, sugar, qty, price }

// CART (put this near the top)

function addToCart() {
    const name = document.getElementById("modalTitle").textContent.trim();
    const imgSrc = document.getElementById("modalImage").getAttribute("src");
    const desc = document.getElementById("modalDesc").textContent.trim();

    const price = sizePrices[size];

    // If editing, update that exact line item (do not merge)
    if (editingId) {
        const item = cart.find(i => i.id === editingId);
        if (item) {
            item.mood = mood;
            item.size = size;
            item.sugar = sugar;
            item.qty = quantity;
            item.price = price;
        }

        editingId = null;
        renderCart();
        saveCart();
        renderCart();
        closeProductModal();

        return;
    }


    // If adding new: merge same options
    const key = `${name}|${mood}|${size}|${sugar}`;
    const existing = cart.find(item => item.id === key);

    if (existing) existing.qty += quantity;
    else {
        cart.push({
            id: key,
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

    renderCart();
    saveCart();
    renderCart();
    closeProductModal();
}


function renderCart() {
    const orderItemsList = document.getElementById("orderItemsList");

    if (!cart.length) {
        orderItemsList.innerHTML = `
      <div class="px-4 py-6 text-center text-sm text-gray-400">
        No items yet
      </div>
    `;
        updateTotals(0);
        return;
    }

    orderItemsList.innerHTML = cart.map(item => {
        const sizeText = item.size === "S" ? "Small" : item.size === "M" ? "Medium" : "Large";
        const moodText = item.mood === "hot" ? "Hot" : "Iced";
        const subtitle = `${sizeText} | ${moodText} | ${item.sugar}`;
        const lineTotal = item.price * item.qty;

        return `
      <div class="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100">
        <div class="flex items-center gap-6 min-w-0">
          <div class="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            <img src="${item.imgSrc}" class="w-16 h-16 object-contain" alt="${item.name}">
          </div>

          <div class="min-w-0">
            <div class="text-lg font-extrabold uppercase truncate">${item.name}</div>
            <div class="text-sm text-amber-950 font-semibold truncate">${subtitle}</div>
            <div class="mt-2 text-base font-extrabold">x${item.qty}</div>
          </div>
        </div>

        <div class="text-base font-extrabold text-gray-900 whitespace-nowrap self-end">
          ₱${lineTotal.toFixed(2)}
        </div>
      </div>
    `;
    }).join("");

    const grandTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    updateTotals(grandTotal);

    const checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.disabled = false;
    checkoutBtn.className =
        "h-14 rounded-2xl bg-black text-white font-semibold tracking-wide shadow transition-all duration-200 hover:bg-white hover:text-black hover:border hover:border-black";
}


// CART MODAL
function openCancelConfirm() {
    const modal = document.getElementById("cancelConfirmModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeCancelConfirm() {
    const modal = document.getElementById("cancelConfirmModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function confirmCancel() {
    closeCancelConfirm();

    // If your cart is stored in localStorage, clear it here too if needed:
    // localStorage.removeItem("cart");

    // Call your existing clearCart() to wipe the UI/order list/total
    if (typeof clearCart === "function") {
        clearCart();
    } else {
        console.warn("clearCart() is not defined.");
    }
}

function openCartModal() {
    renderCartModal();
    const modal = document.getElementById("cartModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeCartModal() {
    const modal = document.getElementById("cartModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}




function renderCartModal() {
    const cartItems = document.getElementById("cartItems");

    if (!cart.length) {
        cartItems.innerHTML = `
      <div class="px-4 py-6 text-center text-sm text-gray-400">
        No items yet
      </div>
    `;
        document.getElementById("cartTotalText").textContent = "₱0.00";
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
            <div class="text-lg font-extrabold uppercase">${item.name}</div>
            <div class="mt-1 text-sm text-amber-950 font-semibold">${subtitle}</div>
            <div class="mt-2 text-base font-extrabold">x${item.qty}</div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-base font-extrabold text-gray-800 whitespace-nowrap">
            ₱${lineTotal.toFixed(2)}
          </div>

          <button
            type="button"
            onclick="editCartItem('${item.id}')"
            class="h-10 px-4 rounded-xl bg-gray-100 font-semibold hover:bg-gray-200"
          >
            Edit
          </button>

          <button
            type="button"
            onclick="removeCartItem('${item.id}')"
            class="h-10 px-4 rounded-xl bg-black text-white font-semibold
                   hover:bg-white hover:text-black hover:border hover:border-black"
          >
            Delete
          </button>
        </div>
      </div>
    `;
    }).join("");

    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById("cartTotalText").textContent = `₱${total.toFixed(2)}`;
}

function updateTotals(total) {
    document.getElementById("orderTotalText").textContent = `₱${total.toFixed(2)}`;
    document.getElementById("orderTotalBox").textContent = `₱${total.toFixed(2)}`;
}

function removeCartItem(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();        // ✅ add this
    renderCart();
}

function editCartItem(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    // close cart modal so the product modal is visible
    closeCartModal();

    openProductModal(item.name, item.imgSrc, item.desc, item);
}

function clearCart() {
    cart = [];
    saveCart();
    renderCart();

    // reset checkout button
    const checkoutBtn = document.getElementById("checkoutBtn");
    checkoutBtn.disabled = true;
    checkoutBtn.className =
        "h-14 rounded-2xl bg-gray-200 text-gray-400 font-semibold tracking-wide cursor-not-allowed";

    // close cart modal if open
    closeCartModal?.();
}



function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem("donmachos_cart")) || [];
    } catch (e) {
        cart = [];
    }
}

function goToCartPage() {
    // make sure latest cart is saved
    saveCart();
    window.location.href = "/cart/"; // change path if needed
}

window.addEventListener("load", () => {
    const editItemRaw = localStorage.getItem("editItem");
    if (!editItemRaw) return;

    const item = JSON.parse(editItemRaw);

    // open modal with item values
    openProductModal(item.name, item.imgSrc, item.desc, item);

    // remove it so it won’t reopen again after refresh
    localStorage.removeItem("editItem");
});



// expose functions for inline onclick="..."
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.changeQty = changeQty;
window.setMood = setMood;
window.setSize = setSize;
window.setSugar = setSugar;
window.addToCart = addToCart;

window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;

window.editCartItem = editCartItem;
window.removeCartItem = removeCartItem;

