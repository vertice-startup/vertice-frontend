const id = new URLSearchParams(window.location.search).get("session_id");
const title = document.querySelector("#report-title");
const copy = document.querySelector("#report-copy");
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function loadAccess() {
  if (!uuidPattern.test(id ?? "")) {
    title.textContent = "Sessão não identificada";
    copy.textContent = "Volte ao início pelo link recebido durante a sua jornada.";
    return;
  }
  try {
    const configResponse = await fetch("/api/config");
    const { supabaseUrl } = await configResponse.json();
    if (!configResponse.ok || !supabaseUrl) throw new Error("Configuration unavailable");
    const response = await fetch(`${supabaseUrl}/functions/v1/report-access?session_id=${encodeURIComponent(id)}`);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Access validation failed");
    if (body.paid) {
      title.textContent = "Pagamento confirmado.";
      copy.textContent = "Seu relatório completo será exibido aqui na próxima etapa da integração.";
      return;
    }
    window.location.replace(`/?session_id=${encodeURIComponent(id)}&payment_pending=true`);
  } catch {
    title.textContent = "Não foi possível validar o acesso.";
    copy.textContent = "Tente novamente em alguns instantes.";
  }
}

loadAccess();
