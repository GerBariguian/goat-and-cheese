const SUPABASE_URL =
  "https://hhrvynshqnzobbfslags.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fBBxDtAePY7hkZWBDD_8gg_YOsR7ihh";

const supabaseClient =
  supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ordersContainer =
  document.getElementById("orders-container");

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

  data.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.classList.add("admin-order-card");

    orderCard.innerHTML = `
      <div class="admin-order-top">
        <strong>Pedido #${order.id}</strong>
        <span class="status-badge">
          ${order.status}
        </span>
      </div>

      <p><strong>Cliente:</strong> ${order.customer_name}</p>
      <p><strong>Teléfono:</strong> ${order.customer_phone}</p>
      <p><strong>Modalidad:</strong> ${order.delivery_type}</p>
      <p><strong>Dirección:</strong> ${order.customer_address || "-"}</p>
      <p><strong>Pago:</strong> ${order.payment_method}</p>
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

  loadOrders();
}

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
    () => {
      console.log("Cambio detectado en orders");
      loadOrders();
    }
  )
  .subscribe();
