const paymentButton = document.querySelector("#payment-button");
const payerForm = document.querySelector("#payer-details");
const paymentSentButton = document.querySelector("#payment-sent-button");
const paymentReportedButton = document.querySelector("#payment-reported-button");
const paymentConfirmation = document.querySelector("#payment-confirmation");
const pixPaymentDetails = document.querySelector("#pix-payment-details");
const reportStatusLink = document.querySelector("#report-status-link");
const copyPixButton = document.querySelector("#copy-pix-button");
const pixInstructions = document.querySelector("#pix-instructions");
const pixPaymentContent = document.querySelector("#pix-payment-content");
const pixCopyPaste = document.querySelector("#pix-copy-paste");
const pixQrCode = document.querySelector("#pix-qr-code");
const payerName = document.querySelector("#payer-name");
const payerCpf = document.querySelector("#payer-cpf");
const payerNameError = document.querySelector("#payer-name-error");
const payerCpfError = document.querySelector("#payer-cpf-error");
const pixTitle = document.querySelector("#pix-title");
const pixDescription = document.querySelector("#pix-description");
const message = document.querySelector("#integration-message");
const checkoutSteps = document.querySelectorAll("#checkout-steps li");
const paymentButtonLabel = paymentButton.innerHTML;
const queryParams = new URLSearchParams(window.location.search);
const sessionId = queryParams.get("session_id");
const paymentPending = queryParams.get("payment_pending") === "true";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const namePartPattern = /^[\p{L}'’-]{2,}$/u;
const payerDetailsStorageKey = sessionId ? `vertice-payer-details-registered:${sessionId}` : "";
let payerDetailsRegistered = payerDetailsStorageKey && window.sessionStorage.getItem(payerDetailsStorageKey) === "true";
let configuration;

async function getConfiguration() {
  if (configuration) return configuration;
  const response = await fetch("/api/config");
  if (!response.ok) throw new Error("Não foi possível carregar a configuração do pagamento.");
  configuration = await response.json();
  return configuration;
}

function sessionIsValid() {
  if (!uuidPattern.test(sessionId ?? "")) {
    message.textContent = "Esta página precisa ser acessada pelo link da sua sessão.";
    return null;
  }
  return sessionId;
}

function setStep(current) {
  checkoutSteps.forEach((step) => {
    const number = Number(step.dataset.step);
    step.classList.toggle("is-current", number === current);
    step.classList.toggle("is-done", number < current);
    if (number === current) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });
}

function scrollAndFocus(element) {
  window.requestAnimationFrame(() => {
    const top = window.scrollY + element.getBoundingClientRect().top - 72;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    window.setTimeout(() => element.focus({ preventScroll: true }), 600);
  });
}

function showPixPayment(pixCopyAndPaste, pixQrCodeUrl) {
  pixCopyPaste.value = pixCopyAndPaste;
  pixQrCode.src = pixQrCodeUrl;
  payerForm.hidden = true;
  pixPaymentContent.hidden = false;
  pixPaymentDetails.hidden = false;
  paymentConfirmation.hidden = true;
  setStep(2);
  pixTitle.textContent = "Pague R$ 29,90 com Pix.";
  pixDescription.textContent = "Use o QR Code ou o Pix Copia e Cola. O relatório é liberado assim que conferirmos o pagamento.";
}

function showPaymentPendingState() {
  pixInstructions.hidden = false;
  payerForm.hidden = true;
  pixPaymentContent.hidden = false;
  pixPaymentDetails.hidden = true;
  paymentConfirmation.hidden = false;
  reportStatusLink.href = `/report?session_id=${encodeURIComponent(sessionId)}`;
  setStep(3);
  pixTitle.textContent = "Seu relatório está sendo preparado.";
  pixDescription.textContent = "Estamos conferindo o pagamento. Você pode acompanhar o status pelo link abaixo.";
  message.textContent = "";
  scrollAndFocus(paymentConfirmation);
}

function setFieldError(field, errorElement, error) {
  field.setAttribute("aria-invalid", String(Boolean(error)));
  errorElement.textContent = error;
  errorElement.hidden = !error;
}

function normalizedName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function validateName(showError = false, forcedError = "") {
  const name = normalizedName(payerName.value);
  let error = forcedError;
  if (!error && !name) error = "Informe o nome completo do titular da conta.";
  if (!error && name.split(" ").length < 2) error = "Informe nome e sobrenome para identificação do pagamento.";
  if (!error && !name.split(" ").every((part) => namePartPattern.test(part))) {
    error = "Use apenas letras e informe pelo menos dois caracteres por nome.";
  }
  if (showError) setFieldError(payerName, payerNameError, error);
  return !error;
}

function cpfDigits(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function formatCpf(value) {
  return cpfDigits(value)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCpf(value) {
  const cpf = cpfDigits(value);
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digitAt = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digitAt(9) === Number(cpf[9]) && digitAt(10) === Number(cpf[10]);
}

function validateCpf(showError = false, forcedError = "") {
  const digits = cpfDigits(payerCpf.value);
  let error = forcedError;
  if (!error && !digits) error = "Informe o CPF do titular da conta.";
  if (!error && digits.length < 11) error = "O CPF deve conter 11 números.";
  if (!error && !isValidCpf(digits)) error = "Informe um CPF válido.";
  if (showError) setFieldError(payerCpf, payerCpfError, error);
  return !error;
}

payerName.addEventListener("input", () => {
  const original = payerName.value;
  const sanitized = original.replace(/[^\p{L}\s'’-]/gu, "").replace(/\s{2,}/g, " ");
  payerName.value = sanitized;
  validateName(true, original !== sanitized ? "Use apenas letras, espaços, hífen ou apóstrofo." : "");
});
payerName.addEventListener("blur", () => validateName(true));
payerCpf.addEventListener("input", () => {
  const original = payerCpf.value;
  const containsNonNumeric = /[^\d.\-\s]/.test(original);
  payerCpf.value = formatCpf(original);
  validateCpf(true, containsNonNumeric ? "Use apenas números no CPF." : "");
});
payerCpf.addEventListener("blur", () => validateCpf(true));

paymentButton.addEventListener("click", async () => {
  if (!sessionIsValid()) return;
  paymentButton.disabled = true;
  paymentButton.textContent = "Carregando Pix…";
  message.textContent = "";
  try {
    const { pixCopyAndPaste, pixQrCodeUrl } = await getConfiguration();
    if (!pixCopyAndPaste) throw new Error("O Pix ainda não foi configurado. Tente novamente em alguns instantes.");
    pixInstructions.hidden = false;
    if (payerDetailsRegistered) {
      showPixPayment(pixCopyAndPaste, pixQrCodeUrl);
      message.textContent = "Use uma das opções Pix abaixo para pagar.";
      scrollAndFocus(pixQrCode);
    } else {
      pixPaymentContent.hidden = true;
      payerForm.hidden = false;
      setStep(1);
      message.textContent = "Informe os dados do titular da conta que fará o Pix.";
      scrollAndFocus(payerName);
    }
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.";
  } finally {
    paymentButton.disabled = false;
    paymentButton.innerHTML = paymentButtonLabel;
  }
});

pixQrCode.addEventListener("error", () => {
  if (!pixQrCode.src.endsWith("pix-qrcode-placeholder.svg")) pixQrCode.src = "/pix-qrcode-placeholder.svg";
});

copyPixButton.addEventListener("click", async () => {
  if (!pixCopyPaste.value) return;
  try { await navigator.clipboard.writeText(pixCopyPaste.value); } catch { pixCopyPaste.select(); document.execCommand("copy"); }
  copyPixButton.textContent = "Código copiado";
  window.setTimeout(() => { copyPixButton.textContent = "Copiar código Pix"; }, 1800);
});

payerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nameValid = validateName(true);
  const cpfValid = validateCpf(true);
  if (!nameValid || !cpfValid) {
    scrollAndFocus(!nameValid ? payerName : payerCpf);
    return;
  }
  const appSessionId = sessionIsValid();
  if (!appSessionId) return;
  paymentSentButton.disabled = true;
  paymentSentButton.textContent = "Registrando…";
  try {
    const { supabaseUrl, pixCopyAndPaste, pixQrCodeUrl } = await getConfiguration();
    const response = await fetch(`${supabaseUrl}/functions/v1/payment-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: appSessionId, payer_name: normalizedName(payerName.value), payer_cpf: cpfDigits(payerCpf.value) }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Não foi possível registrar os dados.");
    if (body.status === "paid") {
      message.textContent = "Pagamento já confirmado. Seu relatório está disponível.";
      return;
    }
    payerDetailsRegistered = true;
    window.sessionStorage.setItem(payerDetailsStorageKey, "true");
    showPixPayment(pixCopyAndPaste, pixQrCodeUrl);
    message.textContent = "Dados registrados. Use uma das opções Pix abaixo para pagar.";
    scrollAndFocus(pixQrCode);
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Não foi possível registrar os dados.";
  } finally {
    paymentSentButton.disabled = false;
    paymentSentButton.textContent = "Continuar para o Pix";
  }
});

paymentReportedButton.addEventListener("click", async () => {
  const appSessionId = sessionIsValid();
  if (!appSessionId) return;
  paymentReportedButton.disabled = true;
  paymentReportedButton.textContent = "Registrando…";
  try {
    const { supabaseUrl } = await getConfiguration();
    const response = await fetch(`${supabaseUrl}/functions/v1/payment-reported`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: appSessionId }),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Não foi possível registrar a confirmação.");
    if (body.status === "paid") {
      message.textContent = "Pagamento já confirmado. Seu relatório está disponível.";
      return;
    }
    showPaymentPendingState();
  } catch (error) {
    message.textContent = error instanceof Error ? error.message : "Não foi possível registrar a confirmação.";
  } finally {
    paymentReportedButton.disabled = false;
    paymentReportedButton.textContent = "Já realizei o pagamento";
  }
});

if (paymentPending && sessionIsValid()) showPaymentPendingState();
