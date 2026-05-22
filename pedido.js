const SUPABASE_URL =
  "https://hhrvynshqnzobbfslags.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_fBBxDtAePY7hkZWBDD_8gg_YOsR7ihh";

const supabaseClient =
  supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const container =
  document.getElementById("order-status-container");

const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

async function loadOrder() {
  if (!orderId) {
    container.innerHTML =
      "<p>No se encontró el número de pedido.</p>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error(error);
    container.innerHTML =
      "<p>No pudimos cargar el pedido.</p>";
    return;
  }

  container.innerHTML = `
    <div class="order-ticket">
      <div class="ticket-title">
        Pedido #${data.id}
      </div>

      <div class="order-progress">

  <div class="progress-step">
    <div class="progress-circle ${
      data.status === "Recibido" ||
      data.status === "En preparación" ||
      data.status === "Listo" ||
      data.status === "Entregado"
        ? "circle-active-yellow"
        : "circle-inactive"
    }"></div>

    <span>Recibido</span>
  </div>

  <div class="progress-line"></div>

  <div class="progress-step">
    <div class="progress-circle ${
      data.status === "En preparación" ||
      data.status === "Listo" ||
      data.status === "Entregado"
        ? "circle-active-orange"
        : "circle-inactive"
    }"></div>

    <span>Preparando</span>
  </div>

  <div class="progress-line"></div>

  <div class="progress-step">
    <div class="progress-circle ${
      data.status === "Listo" ||
      data.status === "Entregado"
        ? "circle-active-green"
        : "circle-inactive"
    }"></div>

    <span>Listo</span>
  </div>

  <div class="progress-line"></div>

  <div class="progress-step">
    <div class="progress-circle ${
      data.status === "Entregado"
        ? "circle-active-gray"
        : "circle-inactive"
    }"></div>

    <span>Entregado</span>
  </div>

</div>

      <div class="ticket-divider"></div>

      <strong>🛒 Pedido</strong><br>
      ${data.order_detail.replace(/\n/g, "<br>")}

      <div class="ticket-divider"></div>

      <div class="ticket-total">
        Total $${Number(data.total).toLocaleString("es-AR")}
      </div>

      <div>
        🕒 ${new Date(data.created_at).toLocaleTimeString(
          "es-AR",
          {
            hour: "2-digit",
            minute: "2-digit"
          }
        )} hs
      </div>

      <div class="ticket-divider"></div>

      <strong>👤 Cliente:</strong> ${data.customer_name}<br>

      📱 ${data.customer_phone}<br>

      🚚 ${data.delivery_type}<br>

      ⏱️ Demora estimada: ${data.estimated_time || "-"}
    </div>
  `;
}

loadOrder();

supabaseClient
  .channel("order-status-changes")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "orders",
      filter: `id=eq.${orderId}`
    },
    () => {
      loadOrder();
    }
  )
  .subscribe();