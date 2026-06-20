// ===== Configuración rápida DOHA =====
// Número oficial en formato internacional sin signos.
const WHATSAPP_NUMBER = "541128074105";

// Editá productos, precios, talles e imágenes desde este bloque.
const PRODUCTS = [
  {
    id: "remera-doha-black",
    name: "Remera DOHA Black",
    price: 28000,
    category: "Remeras",
    image: "assets/imagenes-productos/product-remera-black.png",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "remera-doha-white",
    name: "Remera DOHA White",
    price: 28000,
    category: "Remeras",
    image: "assets/imagenes-productos/product-remera-white.png",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "musculosa-doha",
    name: "Musculosa DOHA",
    price: 24000,
    category: "Musculosas",
    image: "assets/imagenes-productos/product-musculosa.png",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "piluso-doha",
    name: "Piluso DOHA",
    price: 22000,
    category: "Pilusos",
    image: "assets/imagenes-productos/product-piluso.png",
    sizes: ["Único"],
  },
  {
    id: "remera-mujer-doha",
    name: "Remera Mujer DOHA",
    price: 30000,
    category: "Mujer",
    image: "assets/imagenes-productos/product-mujer.png",
    sizes: ["XS", "S", "M", "L"],
  },
];

const CART_STORAGE_KEY = "doha-store-cart";
const CUSTOMER_PLACEHOLDER = "Nombre del cliente pendiente de completar";

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const state = {
  cart: loadCart(),
  activeFilter: "Todos",
};

const productGrid = document.querySelector("[data-product-grid]");
const cartPanel = document.querySelector("[data-cart-panel]");
const cartOverlay = document.querySelector("[data-cart-overlay]");
const cartItems = document.querySelector("[data-cart-items]");
const cartEmpty = document.querySelector("[data-cart-empty]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const toast = document.querySelector("[data-toast]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const header = document.querySelector("[data-header]");

document.addEventListener("DOMContentLoaded", () => {
  setupLogoFallbacks();
  renderProducts();
  renderCart();
  bindEvents();
  updateHeaderState();
});

function bindEvents() {
  document.querySelectorAll("[data-cart-open]").forEach((button) => {
    button.addEventListener("click", openCart);
  });

  document.querySelector("[data-cart-close]").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  document.querySelector("[data-cart-clear]").addEventListener("click", () => {
    state.cart = [];
    persistCart();
    renderCart();
    showToast("Carrito vaciado.");
  });

  document.querySelector("[data-cart-checkout]").addEventListener("click", checkoutCart);

  document.querySelectorAll("[data-whatsapp-general]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openWhatsApp("Hola DOHA STORE, quiero hacer una consulta sobre la colección.");
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
  });

  document.querySelectorAll("[data-filter-link]").forEach((link) => {
    link.addEventListener("click", () => setFilter(link.dataset.filterLink));
  });

  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("scroll", updateHeaderState, { passive: true });
}

function setupLogoFallbacks() {
  document.querySelectorAll("[data-logo-slot]").forEach((slot) => {
    const img = slot.querySelector("[data-logo-img]");
    if (!img) return;

    img.addEventListener("load", () => {
      if (img.naturalWidth > 0) {
        slot.classList.add("has-logo");
      }
    });

    img.addEventListener("error", () => {
      slot.classList.remove("has-logo");
      img.setAttribute("aria-hidden", "true");
    });

    if (img.complete && img.naturalWidth > 0) {
      slot.classList.add("has-logo");
    }
  });
}

function updateHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function setFilter(filter) {
  state.activeFilter = filter || "Todos";
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.activeFilter);
  });
  renderProducts();
}

function renderProducts() {
  const productsToRender =
    state.activeFilter === "Todos"
      ? PRODUCTS
      : PRODUCTS.filter((product) => product.category === state.activeFilter);

  productGrid.innerHTML = productsToRender
    .map((product) => {
      const sizeOptions = product.sizes.map((size) => `<option value="${size}">${size}</option>`).join("");

      return `
        <article class="product-card">
          <div class="product-media">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <span class="product-badge">${product.category}</span>
          </div>
          <div class="product-info">
            <div class="product-title-line">
              <h3>${product.name}</h3>
              <span class="price">${formatPrice(product.price)}</span>
            </div>
            <div class="product-controls">
              <label class="field">
                <span>Talle</span>
                <select data-size-for="${product.id}" aria-label="Elegir talle para ${product.name}">
                  ${sizeOptions}
                </select>
              </label>
              <label class="field">
                <span>Cantidad</span>
                <input data-qty-for="${product.id}" type="number" min="1" max="20" value="1" aria-label="Cantidad para ${product.name}">
              </label>
            </div>
            <div class="product-actions">
              <button class="btn btn-primary" type="button" data-add-product="${product.id}">Agregar al carrito</button>
              <button class="btn btn-secondary" type="button" data-buy-product="${product.id}">Comprar por WhatsApp</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  productGrid.querySelectorAll("[data-add-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.addProduct;
      const payload = getProductSelection(productId);
      addToCart(payload.product, payload.size, payload.quantity);
      openCart();
      showToast("Producto agregado al carrito.");
    });
  });

  productGrid.querySelectorAll("[data-buy-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.buyProduct;
      const { product, size, quantity } = getProductSelection(productId);
      const total = product.price * quantity;
      const message = [
        "Hola DOHA STORE, quiero comprar este producto:",
        "",
        `Cliente: ${CUSTOMER_PLACEHOLDER}`,
        `Producto: ${product.name}`,
        `Talle: ${size}`,
        `Cantidad: ${quantity}`,
        `Total: ${formatPrice(total)}`,
      ].join("\n");
      openWhatsApp(message);
    });
  });
}

function getProductSelection(productId) {
  const product = PRODUCTS.find((item) => item.id === productId);
  const size = document.querySelector(`[data-size-for="${productId}"]`).value;
  const quantityInput = document.querySelector(`[data-qty-for="${productId}"]`);
  const quantity = Math.max(1, Number.parseInt(quantityInput.value, 10) || 1);

  quantityInput.value = quantity;
  return { product, size, quantity };
}

function addToCart(product, size, quantity) {
  const existingItem = state.cart.find((item) => item.id === product.id && item.size === size);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cart.push({ id: product.id, size, quantity });
  }

  persistCart();
  renderCart();
}

function renderCart() {
  const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.cart.reduce((sum, item) => {
    const product = PRODUCTS.find((productItem) => productItem.id === item.id);
    return product ? sum + product.price * item.quantity : sum;
  }, 0);

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = formatPrice(totalPrice);
  cartEmpty.classList.toggle("is-visible", state.cart.length === 0);

  cartItems.innerHTML = state.cart
    .map((item) => {
      const product = PRODUCTS.find((productItem) => productItem.id === item.id);
      if (!product) return "";

      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>Talle ${item.size} · ${formatPrice(product.price)} c/u</p>
            <div class="cart-item__bottom">
              <div class="qty-control" aria-label="Cantidad de ${product.name}">
                <button type="button" data-cart-dec="${cartKey(item)}" aria-label="Restar cantidad">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-inc="${cartKey(item)}" aria-label="Sumar cantidad">+</button>
              </div>
              <button class="remove-item" type="button" data-cart-remove="${cartKey(item)}">Eliminar</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  cartItems.querySelectorAll("[data-cart-inc]").forEach((button) => {
    button.addEventListener("click", () => updateCartItem(button.dataset.cartInc, 1));
  });

  cartItems.querySelectorAll("[data-cart-dec]").forEach((button) => {
    button.addEventListener("click", () => updateCartItem(button.dataset.cartDec, -1));
  });

  cartItems.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", () => removeCartItem(button.dataset.cartRemove));
  });
}

function updateCartItem(key, change) {
  const item = state.cart.find((cartItem) => cartKey(cartItem) === key);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeCartItem(key);
    return;
  }

  persistCart();
  renderCart();
}

function removeCartItem(key) {
  state.cart = state.cart.filter((item) => cartKey(item) !== key);
  persistCart();
  renderCart();
}

function checkoutCart() {
  if (state.cart.length === 0) {
    showToast("Agregá al menos un producto para finalizar.");
    return;
  }

  const lines = state.cart.map((item, index) => {
    const product = PRODUCTS.find((productItem) => productItem.id === item.id);
    const subtotal = product.price * item.quantity;
    return `${index + 1}. ${product.name} - Talle: ${item.size} - Cantidad: ${item.quantity} - Subtotal: ${formatPrice(subtotal)}`;
  });

  const total = state.cart.reduce((sum, item) => {
    const product = PRODUCTS.find((productItem) => productItem.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  const message = [
    "Hola DOHA STORE, quiero finalizar esta compra:",
    "",
    `Cliente: ${CUSTOMER_PLACEHOLDER}`,
    "",
    "Productos:",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
  ].join("\n");

  openWhatsApp(message);
}

function openCart() {
  document.body.classList.add("cart-open");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartPanel.setAttribute("aria-hidden", "true");
}

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function cartKey(item) {
  return `${item.id}__${item.size}`;
}

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch {
    return [];
  }
}

function persistCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
}

function formatPrice(value) {
  return formatter.format(value);
}

let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2400);
}
