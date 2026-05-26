const SUPABASE_URL =
  "https://hhrvynshqnzobbfslags.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fBBxDtAePY7hkZWBDD_8gg_YOsR7ihh";

const ADMIN_PIN = "1234";

let currentFilter = "Todos";

const supabaseClient =
  supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ordersContainer =
  document.getElementById("orders-container");

const adminLogin =
  document.getElementById("admin-login");

const adminPanel =
  document.getElementById("admin-panel");

const adminPinInput =
  document.getElementById("admin-pin");

const adminLoginButton =
  document.getElementById("admin-login-button");

const adminError =
  document.getElementById("admin-error");

const logoutButton =
  document.getElementById("logout-button");

const adminToast =
  document.getElementById("admin-toast");

function showAdminToast(message) {
  adminToast.textContent = message;
  adminToast.classList.add("show");

  setTimeout(() => {
    adminToast.classList.remove("show");
  }, 2500);
}

function getStatusClass(status) {
  if (status === "Recibido") {
    return "status-received";
  }

  if (status === "En preparación") {
    return "status-preparing";
  }

  if (status === "Listo") {
    return "status-ready";
  }

  if (status === "Entregado") {
    return "status-delivered";
  }

  return "";
}

async function loadOrders() {
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    ordersContainer.innerHTML =
      "<p>Error cargando pedidos.</p>";
    return;
  }

  if (data.length === 0) {
    ordersContainer.innerHTML =
      "<p>No hay pedidos todavía.</p>";
    return;
  }

  ordersContainer.innerHTML = "";

const filteredData =
  currentFilter === "Todos"
    ? data.filter(order => order.status !== "Entregado")
    : data.filter(order => order.status === currentFilter);
  
filteredData.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.classList.add("admin-order-card");

    orderCard.innerHTML = `
      <div class="admin-order-top">
        <strong>Pedido #${order.id}</strong>
        <span class="status-badge ${getStatusClass(order.status)}">
          ${order.status}
        </span>
      </div>

      <p><strong>Cliente:</strong> ${order.customer_name}</p>
      <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
      <p><strong>Modalidad:</strong> ${order.delivery_type}</p>
      <p><strong>Demora:</strong> ${order.estimated_time || "-"}</p>
      <p><strong>Dirección:</strong> ${order.customer_address || "-"}</p>
      <p><strong>Pago:</strong> ${order.payment_method}</p>
      <p>
        <strong>Hora:</strong>
        ${new Date(order.created_at).toLocaleTimeString(
          "es-AR",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )} hs
      </p>
      <p><strong>Total:</strong> $${Number(order.total).toLocaleString("es-AR")}</p>

      <div class="admin-order-detail">
        ${order.order_detail.replace(/\n/g, "<br>")}
      </div>

      <p><strong>Comentarios:</strong> ${order.comments || "Sin comentarios"}</p>
      <div class="admin-actions">

        <button onclick="updateStatus(${order.id}, 'Recibido')">
          🟡 Recibido
        </button>

        <button onclick="updateStatus(${order.id}, 'En preparación')">
          🟠 Preparando
        </button>

        <button onclick="updateStatus(${order.id}, 'Listo')">
          🟢 Listo
        </button>

        <button onclick="updateStatus(${order.id}, 'Entregado')">
          ⚫ Entregado
        </button>

        <button onclick='sendWhatsappToCustomer(
          ${order.id},
          ${JSON.stringify(order.customer_name)},
          ${JSON.stringify(order.customer_phone)},
          ${JSON.stringify(order.status)},
          ${JSON.stringify(order.delivery_type)},
          ${JSON.stringify(order.payment_method)}
        )'>
          📲 WhatsApp
        </button>

      </div>
    `;

    ordersContainer.appendChild(orderCard);
  });
}

async function updateStatus(orderId, newStatus) {

  const { error } = await supabaseClient
    .from("orders")
    .update({
      status: newStatus
    })
    .eq("id", orderId);

  if (error) {
    console.error(error);
    alert("Error actualizando estado");
    return;
  }

}

function playNewOrderSound() {
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );

  audio.play();
}

function setFilter(status) {
  currentFilter = status;
  loadOrders();
}

function sendWhatsappToCustomer(
  orderId,
  customerName,
  customerPhone,
  status,
  deliveryType,
  paymentMethod
) {
  const cleanPhone =
    customerPhone.replace(/[^0-9]/g, "");

  const trackingUrl =
    `${window.location.origin}${window.location.pathname.replace("admin.html", "pedido.html")}?id=${orderId}`;

  let statusMessage = "";

  if (status === "Recibido") {
    statusMessage =
      "Tu pedido fue recibido correctamente ✅";
  } else if (status === "En preparación") {
    statusMessage =
      "Tu pedido ya está en preparación 🍔";
  } else if (status === "Listo") {
    if (deliveryType === "Retiro por local") {
      statusMessage =
        "Tu pedido ya está listo, podés pasar a retirarlo. ¡Te esperamos! 🟢";
    } else {
      statusMessage =
        "Tu pedido ya está listo y será enviado en breve 🛵";
    }
  } else if (status === "Entregado") {
    statusMessage =
      "Tu pedido fue entregado. ¡Gracias por elegirnos! 🙌";
  } else {
    statusMessage =
      `El estado actual de tu pedido es: ${status}`;
  }

  const introMessage =
    status === "Recibido"
      ? `Hola ${customerName}!`
      : `Hola ${customerName},`;

  const lines = [
    introMessage,
    statusMessage
  ];

  if (status === "Recibido") {
    lines.push(
      "",
      `Pedido #${orderId}`,
      "",
      "Podés seguir el estado en tiempo real acá:",
      trackingUrl
    );

    if (paymentMethod === "Transferencia") {
      lines.push(
        "",
        "Alias: goatandcheese",
        "Enviar comprobante por favor 🙌"
      );
    }
  }

  lines.push("", "Goat & Cheese");

  const message = lines.join("\n");

  const whatsappUrl =
    `https://wa.me/54${cleanPhone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
}

function startAdminPanel() {
  loadOrders();

  supabaseClient
    .channel("orders-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders"
      },
      (payload) => {
        console.log("Cambio detectado en orders", payload);

        if (payload.eventType === "INSERT") {
          playNewOrderSound();
	  showAdminToast(`🔥 Nuevo pedido #${payload.new.id}`);
        }

        loadOrders();
      }
    )
    .subscribe();
}

function loginAdmin() {
  localStorage.setItem("adminLoggedIn", "true");

  adminLogin.style.display = "none";
  adminPanel.style.display = "block";
  logoutButton.style.display = "inline-block";

  startAdminPanel();
}

adminLoginButton.addEventListener("click", () => {
  if (adminPinInput.value === ADMIN_PIN) {
    loginAdmin();
  } else {
    adminError.textContent = "PIN incorrecto";
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("adminLoggedIn");
  location.reload();
});

if (localStorage.getItem("adminLoggedIn") === "true") {
  loginAdmin();
}
