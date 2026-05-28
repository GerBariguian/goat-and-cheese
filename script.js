const SUPABASE_URL =
  "https://hhrvynshqnzobbfslags.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fBBxDtAePY7hkZWBDD_8gg_YOsR7ihh";

const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


const testMode = false;

const products = [
  {
    name: "CHEESEBURGER",
    description: "Queso cheddar",
    simplePrice: 13000,
    doublePrice: 16500,
    image: "assets/cheeseburger.png"
  },
  {
    name: "TERNERITA",
    description: "Cheddar, lechuga, tomate, cebolla, salsa goat",
    simplePrice: 14000,
    doublePrice: 18000,
    image: "assets/ternerita.png"
  },
  {
    name: "CUERNITO",
    description: "Cheddar, cebolla, bacon, mostaza, ketchup",
    simplePrice: 14000,
    doublePrice: 18000,
    image: "assets/cuernito.png"
  },
  {
    name: "CAPRICHOSA",
    description: "Cheddar, mermelada de bacon, barbacoa",
    simplePrice: 15000,
    doublePrice: 19000,
    image: "assets/caprichosa.png"
  },
  {
    name: "GOAT DEL MES",
    description: "Cheddar, sweet bacon, salsa sweet",
    simplePrice: 15000,
    doublePrice: 19000,
    image: "assets/hero-burger.png",
    badge: "GOAT DEL MES"
  }
];

const cart =
  JSON.parse(localStorage.getItem("goatCart")) || [];

const productsContainer = document.getElementById("products-container");
const cartContainer = document.getElementById("cart-container");
const totalPriceElement = document.getElementById("total-price");
const toast = document.getElementById("toast");
const deliveryTypeSelect =
  document.getElementById("delivery-type");

const addressGroup =
  document.getElementById("address-group");

function renderProducts() {

  products.forEach((product) => {

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
      </div>
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
  saveCart();
  showToast("✅ Producto agregado");
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
  saveCart();
}


function showToast(message) {

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);

}


function increaseQuantity(index) {
  cart[index].quantity += 1;
  renderCart();
  saveCart();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity -= 1;
  } else {
    cart.splice(index, 1);
  }

  renderCart();
  saveCart();
}


function saveCart() {
  localStorage.setItem(
    "goatCart",
    JSON.stringify(cart)
  );
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
    stickyCount.textContent = "0 productos";
    stickyTotal.textContent = "$0";
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

const customerNameInput =
  document.getElementById("customer-name");

customerNameInput.addEventListener("input", () => {

  customerNameInput.value =
    customerNameInput.value.replace(
      /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
      ""
    );

});

customerNameInput.addEventListener("blur", () => {

  validateField(
    customerNameInput,
    customerNameInput.value.trim().length >= 3
  );

});

const customerPhoneInput =
  document.getElementById("customer-phone");

customerPhoneInput.addEventListener("input", () => {

  let numbersOnly =
    customerPhoneInput.value.replace(/[^0-9]/g, "");

  if (numbersOnly.length > 10) {
    numbersOnly = numbersOnly.slice(0, 10);
  }

  if (numbersOnly.length > 6) {
    customerPhoneInput.value =
      `${numbersOnly.slice(0, 2)} ${numbersOnly.slice(2, 6)}-${numbersOnly.slice(6)}`;
  } else if (numbersOnly.length > 2) {
    customerPhoneInput.value =
      `${numbersOnly.slice(0, 2)} ${numbersOnly.slice(2)}`;
  } else {
    customerPhoneInput.value = numbersOnly;
  }

});

customerPhoneInput.addEventListener("blur", () => {

  const numbersOnly =
    customerPhoneInput.value.replace(/[^0-9]/g, "");

  validateField(
    customerPhoneInput,
    numbersOnly.length === 10
  );

});

function validateField(input, isValid) {

  input.classList.remove(
    "valid-input",
    "invalid-input"
  );

  if (input.value.trim() === "") {
    return;
  }

  if (isValid) {
    input.classList.add("valid-input");
  } else {
    input.classList.add("invalid-input");
  }

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
  const allowedZones = [
    "boedo",
    "caballito",
    "parque chacabuco",
    "almagro",
    "flores",
    "san cristobal"
];
  const paymentMethod = document.getElementById("payment-method").value;
  const comments = document.getElementById("comments").value;

  const phoneNumbersOnly =
    customerPhone.replace(/[^0-9]/g, "");

  if (customerName.trim().length < 3) {
    validateField(customerNameInput, false);
    alert("El nombre debe tener al menos 3 letras.");
    return;
  }

  if (phoneNumbersOnly.length !== 10) {
    validateField(customerPhoneInput, false);
    alert("El teléfono debe tener 10 números.");
    return;
  }

  if (deliveryType === "Envío a domicilio") {

    if (!customerAddress) {
      alert("Completá la dirección para el envío.");
      return;
  }

  const addressLower = customerAddress.toLowerCase();

  const insideZone = allowedZones.some(zone =>
    addressLower.includes(zone)
  );

  if (!insideZone) {
    alert("⚠️ Por el momento no llegamos a esa zona.");
    return;
  }

}


  let subtotal = 0;
  let orderDetail = "";

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    orderDetail += `🍔 ${item.name} ${item.type ? `(${item.type})` : ""} x${item.quantity} - $${itemTotal.toLocaleString("es-AR")}\n`;
  });

  const shippingCost = deliveryType === "Envío a domicilio" ? 2000 : 0;
  const total = subtotal + shippingCost;
  const estimatedTime =
  deliveryType === "Envío a domicilio"
    ? "35-45 min"
    : "15-20 min";

  let message =
`✅ Pedido confirmado

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
    Pedido confirmado ✅
  </div>


  <div class="ticket-divider"></div>

  <strong>🛒 Pedido</strong><br>

  ${orderDetail.replace(/\n/g, "<br>")}

  <div class="ticket-divider"></div>

  <div>
    Subtotal: $${subtotal.toLocaleString("es-AR")}
  </div>

  <div>
    Envío: $${shippingCost.toLocaleString("es-AR")}
  </div>

  <div class="ticket-total">
    Total $${total.toLocaleString("es-AR")}
  </div>

  <div class="ticket-divider"></div>

  <strong>👤 ${customerName}</strong><br>
  📱 ${customerPhone}<br>
  🚚 ${deliveryType}
  <br>
  ⏱️ Demora estimada: ${estimatedTime}

  ${deliveryType === "Envío a domicilio"
    ? `<br>📍 ${customerAddress}`
    : ""
  }

  <br>
  💳 ${paymentMethod}

  ${comments
    ? `<br>📝 ${comments}`
    : ""
  }
`;

  document.getElementById("order-ticket").innerHTML = ticketHTML;

  document.getElementById("success-section").style.display = "block";

  document
    .getElementById("success-section")
    .scrollIntoView({ behavior: "smooth" });


supabaseClient
  .from("orders")
  .insert([
    {
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_type: deliveryType,
      customer_address: customerAddress,
      payment_method: paymentMethod,
      comments: comments,
      order_detail: orderDetail,
      total: total,
      estimated_time: estimatedTime,
      status: "Recibido"
    }
  ])
  .select()
  .single()
  .then(({ data, error }) => {

    if (error) {
      console.error(error);

      alert(
        "Error guardando pedido:\n\n" +
        error.message
      );

      return;
    }

    console.log("Pedido guardado en Supabase ✅", data);

    const trackingLink =
      `pedido.html?id=${data.id}`;

    const trackingButton =
      document.getElementById("tracking-link");

    if (trackingButton) {
      trackingButton.href = trackingLink;
      trackingButton.style.display = "block";
}

  });

  document.getElementById("generate-order").textContent = "Pedido confirmado ✅";
  document.getElementById("generate-order").disabled = true;
}

function toggleAddressField() {

  const deliveryType =
    deliveryTypeSelect.value;

  if (deliveryType === "Envío a domicilio") {
    addressGroup.style.display = "block";
  } else {
    addressGroup.style.display = "none";
  }

}


async function checkSoldOutStatus() {
  const { data, error } = await supabaseClient
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  const soldOutWarning =
    document.getElementById("sold-out-warning");

  const orderSection =
    document.querySelector(".order-section");

  if (data.is_sold_out) {
    soldOutWarning.textContent =
      data.message || "Hoy nos quedamos sin stock. Volvemos pronto.";

    soldOutWarning.style.display = "block";
    orderSection.classList.add("disabled");
  } else {
    soldOutWarning.style.display = "none";
    orderSection.classList.remove("disabled");
  }
}

async function checkStoreStatus() {
  const now = new Date();

  const day = now.getDay();
  const hour = now.getHours();

  const isFriday = day === 5;
  const isSaturday = day === 6;

  const isOpenHour = hour >= 20 && hour < 23;

  let isOpen = testMode || ((isFriday || isSaturday) && isOpenHour);

  const { data, error } = await supabaseClient
    .from("store_settings")
    .select("store_mode")
    .eq("id", 1)
    .single();

  if (!error && data) {
    if (data.store_mode === "open") {
      isOpen = true;
    }

    if (data.store_mode === "closed") {
      isOpen = false;
    }
  }

  const statusElement = document.getElementById("store-status");
  const warningElement = document.getElementById("closed-warning");
  const orderSection = document.querySelector(".order-section");

  if (isOpen) {
    statusElement.textContent =
      data?.store_mode === "open"
        ? "🟢 Abierto ahora - Tomando pedidos"
        : testMode
          ? "🧪 Modo prueba activo - Pedidos habilitados"
          : "🟢 Abierto ahora - Tomando pedidos";

    statusElement.classList.add("open");
    statusElement.classList.remove("closed");

    warningElement.style.display = "none";
    orderSection.classList.remove("disabled");
  } else {
    statusElement.textContent =
      data?.store_mode === "closed"
        ? "🔴 Local cerrado"
        : "🔴 Cerrado ahora - Viernes y sábados de 20 a 23 hs";

    statusElement.classList.add("closed");
    statusElement.classList.remove("open");

    warningElement.style.display = "block";
    orderSection.classList.add("disabled");
  }
}

  document.getElementById("go-to-cart").addEventListener("click", () => {
    document
      .getElementById("cart-section")
      .scrollIntoView({ behavior: "smooth" });
});


deliveryTypeSelect.addEventListener(
  "change",
  toggleAddressField
);

toggleAddressField();

renderProducts();
renderCart();
checkStoreStatus();
checkSoldOutStatus();

supabaseClient
  .channel("store-settings-index-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "store_settings"
    },
    () => {
      checkStoreStatus();
      checkSoldOutStatus();
    }
  )
  .subscribe();