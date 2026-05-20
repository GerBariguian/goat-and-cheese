const testMode = true;

const products = [
  {
    name: "CHEESEBURGER",
    description: "Queso cheddar",
    simplePrice: 13000,
    doublePrice: 16500
  },
  {
    name: "TERNERITA",
    description: "Cheddar, lechuga, tomate, cebolla, salsa goat",
    simplePrice: 14000,
    doublePrice: 18000
  },
  {
    name: "CUERNITO",
    description: "Cheddar, cebolla, bacon, mostaza, ketchup",
    simplePrice: 14000,
    doublePrice: 18000
  },
  {
    name: "CAPRICHOSA",
    description: "Cheddar, mermelada de bacon, barbacoa",
    simplePrice: 15000,
    doublePrice: 19000
  },
  {
    name: "GOAT DEL MES",
    description: "Cheddar, sweet bacon, salsa sweet",
    simplePrice: 15000,
    doublePrice: 19000
  }
];

const cart = [];

const productsContainer = document.getElementById("products-container");
const cartContainer = document.getElementById("cart-container");
const totalPriceElement = document.getElementById("total-price");

function renderProducts() {

  products.forEach((product) => {

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
      <h3>${product.name}</h3>

      <p class="product-description">
        ${product.description}
      </p>

      <div class="product-price">
        Simple: $${product.simplePrice.toLocaleString("es-AR")} <br>
        Doble: $${product.doublePrice.toLocaleString("es-AR")}
      </div>

      <div class="variant-buttons">
        <button onclick="addToCart('${product.name}', 'Simple', ${product.simplePrice})">
          Simple
        </button>

        <button onclick="addToCart('${product.name}', 'Doble', ${product.doublePrice})">
          Doble
        </button>
      </div>
    `;

    productsContainer.appendChild(productCard);

  });

  // TRILOGÍA

  const trilogyCard = document.createElement("div");

  trilogyCard.classList.add("product-card");

  trilogyCard.innerHTML = `
    <h3>TRILOGÍA</h3>

    <p class="product-description">
      Caprichosa simple, Ternerita simple, Cuernito simple, Papas x1
    </p>

    <div class="product-price">
      $26.000
    </div>

    <div class="variant-buttons">
      <button onclick="addToCart('TRILOGÍA', '', 26000)">
        Agregar
      </button>
    </div>
  `;

  productsContainer.appendChild(trilogyCard);

  // EXTRAS

  const extrasCard = document.createElement("div");

  extrasCard.classList.add("product-card");

  extrasCard.innerHTML = `
    <h3>EXTRAS</h3>

    <div class="variant-buttons">
      <button onclick="addToCart('Extra carne', '', 4000)">
        Extra carne +$4.000
      </button>

      <button onclick="addToCart('Extra papas', '', 5000)">
        Extra papas +$5.000
      </button>
    </div>
  `;

  productsContainer.appendChild(extrasCard);

  // ACLARACIÓN

  const infoCard = document.createElement("div");

  infoCard.classList.add("product-card");

  infoCard.innerHTML = `
    <h3>🍟 TODAS LAS HAMBURGUESAS VIENEN CON PAPAS</h3>
  `;

  productsContainer.appendChild(infoCard);

}

function addToCart(name, type, price) {
  const existingItem = cart.find(
    item => item.name === name && item.type === type
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      type,
      price,
      quantity: 1
    });
  }

  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}


function increaseQuantity(index) {
  cart[index].quantity += 1;
  renderCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  renderCart();
}


function renderCart() {
  cartContainer.innerHTML = "";

  const stickyCart = document.getElementById("sticky-cart");
  const stickyCount = document.getElementById("sticky-count");
  const stickyTotal = document.getElementById("sticky-total");

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <p class="empty-cart">
        Todavía no agregaste productos.
      </p>
    `;

    totalPriceElement.textContent = "0";
    stickyCart.style.display = "none";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <div class="cart-item-info">
        <strong>
          🍔 ${item.name} ${item.type ? `(${item.type})` : ""}
        </strong>
        <span>
          $${item.price.toLocaleString("es-AR")} c/u
        </span>
      </div>

      <div class="cart-controls">
        <button onclick="decreaseQuantity(${index})">-</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity(${index})">+</button>
        <button class="remove-button" onclick="removeFromCart(${index})">Quitar</button>
      </div>
    `;

    cartContainer.appendChild(cartItem);
  });

  totalPriceElement.textContent = total.toLocaleString("es-AR");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  stickyCount.textContent = `${totalItems} producto${totalItems !== 1 ? "s" : ""}`;
  stickyTotal.textContent = `$${total.toLocaleString("es-AR")}`;
  stickyCart.style.display = "flex";
}


document
  .getElementById("generate-order")
  .addEventListener("click", generateOrder);

function generateOrder() {
  if (cart.length === 0) {
    alert("Agregá al menos un producto.");
    return;
  }

  const customerName = document.getElementById("customer-name").value;
  const customerPhone = document.getElementById("customer-phone").value;
  const deliveryType = document.getElementById("delivery-type").value;
  const customerAddress = document.getElementById("customer-address").value;
  const paymentMethod = document.getElementById("payment-method").value;
  const comments = document.getElementById("comments").value;

  if (!customerName || !customerPhone) {
    alert("Completá tu nombre y teléfono para confirmar el pedido.");
    return;
  }

  if (deliveryType === "Envío a domicilio" && !customerAddress) {
    alert("Completá la dirección para el envío.");
    return;
  }

  const orderNumber = Math.floor(1000 + Math.random() * 9000);

  let subtotal = 0;
  let orderDetail = "";

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    orderDetail += `🍔 ${item.name} ${item.type ? `(${item.type})` : ""} x${item.quantity} - $${itemTotal.toLocaleString("es-AR")}\n`;
  });

  const shippingCost = deliveryType === "Envío a domicilio" ? 2000 : 0;
  const total = subtotal + shippingCost;

  let message =
`✅ Pedido #${orderNumber} confirmado

Estado: Pendiente de confirmación del local

Detalle:
${orderDetail}
Subtotal: $${subtotal.toLocaleString("es-AR")}
Envío: $${shippingCost.toLocaleString("es-AR")}
Total estimado: $${total.toLocaleString("es-AR")}

Datos del cliente:
Nombre: ${customerName}
Teléfono: ${customerPhone}
Modalidad: ${deliveryType}`;

  if (deliveryType === "Envío a domicilio") {
    message += `
Dirección: ${customerAddress}`;
  }

  message += `
Pago: ${paymentMethod}
Comentarios: ${comments || "Sin comentarios"}

El local se comunicará para confirmar el pedido y el estado de la compra.`;

  document.getElementById("order-message").value = message;

  const ticketHTML = `
    <div class="ticket-title">
      Pedido #${orderNumber} ✅
    </div>

    <div class="ticket-status">
      Pendiente de confirmación del local
    </div>

    <div class="ticket-divider"></div>

    <strong>Detalle:</strong><br><br>

    ${orderDetail.replace(/\n/g, "<br>")}

    <div class="ticket-divider"></div>

    <strong>Subtotal:</strong> $${subtotal.toLocaleString("es-AR")}<br>
    <strong>Envío:</strong> $${shippingCost.toLocaleString("es-AR")}

    <div class="ticket-total">
      Total: $${total.toLocaleString("es-AR")}
    </div>

    <div class="ticket-divider"></div>

    <strong>Cliente:</strong><br>
    ${customerName}<br>
    ${customerPhone}

    <br><br>

    <strong>Modalidad:</strong><br>
    ${deliveryType}

    ${deliveryType === "Envío a domicilio"
      ? `<br><br><strong>Dirección:</strong><br>${customerAddress}`
      : ""
    }

    <br><br>

    <strong>Pago:</strong><br>
    ${paymentMethod}

    <br><br>

    <strong>Comentarios:</strong><br>
    ${comments || "Sin comentarios"}
  `;

  document.getElementById("order-ticket").innerHTML = ticketHTML;

  const whatsappMessage = encodeURIComponent(message);

  const whatsappNumber = "5491140278163";

  const whatsappURL =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  document
    .getElementById("whatsapp-button")
    .href = whatsappURL;

  document.getElementById("generate-order").textContent = "Pedido confirmado ✅";
  document.getElementById("generate-order").disabled = true;
}

function checkStoreStatus() {
  const now = new Date();

  const day = now.getDay();
  const hour = now.getHours();

  const isFriday = day === 5;
  const isSaturday = day === 6;

  const isOpenHour = hour >= 20 && hour < 23;

  const isOpen = testMode || ((isFriday || isSaturday) && isOpenHour);

  const statusElement = document.getElementById("store-status");
  const warningElement = document.getElementById("closed-warning");
  const orderSection = document.querySelector(".order-section");

  if (isOpen) {

    statusElement.textContent = testMode
      ? "🧪 Modo prueba activo - Pedidos habilitados"
      : "🟢 Abierto ahora - Tomando pedidos";
    statusElement.classList.add("open");
    statusElement.classList.remove("closed");

    warningElement.style.display = "none";
    orderSection.classList.remove("disabled");
  } else {
    statusElement.textContent = "🔴 Cerrado ahora - Viernes y sábados de 20 a 23 hs";
    statusElement.classList.add("closed");
    statusElement.classList.remove("open");

    warningElement.style.display = "block";
    orderSection.classList.add("disabled");
  }
}

checkStoreStatus();
renderProducts();