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

function getStatusEmoji(status) {
  if (status === "Recibido") return "🟡";
  if (status === "En preparación") return "🟠";
  if (status === "Listo") return "🟢";
  return "⚪";
}

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

      <div class="ticket-status">
        ${getStatusEmoji(data.status)} ${data.status}
      </div>

      <div class="ticket-divider"></div>

      <strong>🛒 Pedido</strong><br>
      ${data.order_detail.replace(/\n/g, "<br>")}

      <div class="ticket-divider"></div>

      <div class="ticket-total">
        Total $${Number(data.total).toLocaleString("es-AR")}
      </div>

      <div class="ticket-divider"></div>

      <strong>👤 Cliente</strong><br>
      ${data.customer_name}<br>
      📱 ${data.customer_phone}<br>
      🚚 ${data.delivery_type}
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