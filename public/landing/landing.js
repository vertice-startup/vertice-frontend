const whatsappNumber = "+55 32 98494-9088";
const whatsappMessage = "Oi! Quero estruturar minha ideia com a Vértice.";
const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
const checkoutUrl = "/checkout";
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const checkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
const arrowIcon = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const lockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const readIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13l4 4 8-9M10 15.5l1.5 1.5 8-9"/></svg>';
const verifiedIcon = '<svg class="verif" viewBox="0 0 24 24" aria-label="verificado"><path fill="#1d9bf0" d="M12 1.6l2.3 1.7 2.9-.2.9 2.7 2.4 1.7-.9 2.7.9 2.7-2.4 1.7-.9 2.7-2.9-.2L12 22.4l-2.3-1.7-2.9.2-.9-2.7-2.4-1.7.9-2.7-.9-2.7 2.4-1.7.9-2.7 2.9.2z"/><path d="M8 12.2l2.6 2.6L16.2 9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function escapeHtml(text) {
  return text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function whenVisible(element, threshold, callback) {
  if (!("IntersectionObserver" in window)) {
    callback(true);
    return;
  }
  new IntersectionObserver(([entry]) => callback(entry.isIntersecting), { threshold }).observe(element);
}

/* ---------- Links de WhatsApp ---------- */
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = whatsappUrl;
});

/* ---------- Tema claro/escuro ---------- */
const themeButton = document.querySelector("#botao-tema");

function syncThemeButton() {
  const dark = root.dataset.theme === "dark";
  themeButton.setAttribute("aria-label", dark ? "Mudar para tema claro" : "Mudar para tema escuro");
}

function toggleTheme() {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  const apply = () => {
    root.dataset.theme = next;
    syncThemeButton();
    updateHeader();
    try { localStorage.setItem("vertice-tema", next); } catch {}
  };
  if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
  else apply();
}

themeButton.addEventListener("click", toggleTheme);
window.addEventListener("keydown", (event) => {
  if ((event.key === "t" || event.key === "T") && !/input|textarea/i.test(event.target.tagName) && !event.metaKey && !event.ctrlKey && !event.altKey) toggleTheme();
});
syncThemeButton();

/* ---------- Cabeçalho: fica claro sobre seções claras ---------- */
const header = document.querySelector("#cabecalho");

function updateHeader() {
  const below = document.elementsFromPoint(window.innerWidth / 2, 50).find((el) => !el.closest(".hd") && el.closest("section, .faixa, footer"));
  const section = below ? below.closest("section, .faixa, footer") : null;
  const overLight = !!section && !section.classList.contains("stage") && !section.classList.contains("rod");
  header.classList.toggle("claro", overLight && root.dataset.theme === "light");
}

document.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ---------- Revelar ao rolar ---------- */
const revealItems = document.querySelectorAll(".rv");
if (!("IntersectionObserver" in window) || reduceMotion) {
  revealItems.forEach((item) => item.classList.add("in"));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });
  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ---------- Letreiros: duplica o conteúdo para o loop não ter emenda ---------- */
document.querySelectorAll(".trilho, .msgs .linha").forEach((track) => {
  [...track.children].forEach((child) => {
    const clone = child.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
});

/* ---------- Demo do hero: conversa que monta o canvas ---------- */
const canvasBlocks = [
  { key: "quem", title: "Pra quem", text: "Clínicas de estética com 2 a 10 profissionais" },
  { key: "dor", title: "Dor", text: "Faltas sem aviso: até 20% da agenda perdida" },
  { key: "proposta", title: "Proposta de valor", text: "IA no WhatsApp que confirma e reagenda sozinha" },
  { key: "receita", title: "Como ganha dinheiro", text: "SaaS mensal por profissional, a partir de R$ 99" },
  { key: "teste", title: "Próximo teste", text: "Landing + 15 clínicas no Instagram, meta: 5 demos" },
];
const demoMessages = [
  { from: "v", text: "Olá! Tudo bem? Me conte por mensagem a ideia de negócio que você tem vontade de tirar do papel.", time: "07:02" },
  { from: "u", text: "quero fazer um SaaS com IA que atende no WhatsApp pra clínica de estética", time: "07:03" },
  { from: "v", text: "Boa, nicho aquecido. Antes do código: que problema a clínica paga pra resolver?", time: "07:03" },
  { from: "u", text: "paciente marca e não aparece. a recepção não dá conta de confirmar todo mundo", time: "07:04", blocks: ["dor"] },
  { from: "v", text: "E quem é o cliente pagante? Tamanho da clínica, quem decide a compra?", time: "07:04" },
  { from: "u", text: "clínicas de 2 a 10 profissionais, quem decide é a dona", time: "07:05", blocks: ["quem"] },
  { from: "v", text: "Como você imagina cobrar por isso?", time: "07:05" },
  { from: "u", text: "mensalidade por profissional, uns R$ 99", time: "07:06", blocks: ["receita"] },
  { from: "v", text: "Pronto ✅ Seu canvas está montado, com as hipóteses marcadas e 1 teste pra validar antes de codar.", time: "07:06", blocks: ["proposta", "teste"] },
];

const demo = document.querySelector("#demo");
const demoChat = document.querySelector("#demo-chat");
const demoStatus = document.querySelector("#demo-status");
const demoProgress = document.querySelector("#demo-progresso");
const demoBlocks = document.querySelector("#demo-blocos");

demoBlocks.innerHTML = canvasBlocks.map((block) => `
  <div class="cv-bl" data-bloco="${block.key}">
    <div class="cab"><h5>${block.title}</h5><span class="ok">${checkIcon}</span></div>
    <p>${escapeHtml(block.text)}</p>
    <div class="esq"><i></i><i></i></div>
  </div>`).join("");

function bubbleHtml(message) {
  const sender = message.from === "v" ? `<span class="quem"><img src="/img/avatar-vertice.png" alt="" /><b>Vértice</b>${verifiedIcon}</span>` : "";
  const read = message.from === "u" ? readIcon : "";
  return `<div class="bal ${message.from === "v" ? "bal-v" : "bal-u"}">${sender}${escapeHtml(message.text)}<span class="hr">${message.time}${read}</span></div>`;
}

function setTyping(typing) {
  demoStatus.textContent = typing ? "digitando…" : "online";
  demoStatus.classList.toggle("dig", typing);
  const indicator = demoChat.querySelector(".digitando");
  if (typing && !indicator) demoChat.insertAdjacentHTML("beforeend", '<div class="digitando" aria-hidden="true"><i></i><i></i><i></i></div>');
  if (!typing && indicator) indicator.remove();
}

function fillBlocks(keys) {
  keys.forEach((key) => {
    const block = demoBlocks.querySelector(`[data-bloco="${key}"]`);
    block.classList.add("on");
    demoBlocks.querySelectorAll(".flash").forEach((item) => item.classList.remove("flash"));
    void block.offsetWidth;
    if (key === keys[0]) block.classList.add("flash");
  });
  demoProgress.textContent = `${demoBlocks.querySelectorAll(".on").length}/5`;
}

function resetDemo() {
  demoChat.innerHTML = "";
  demoBlocks.querySelectorAll(".cv-bl").forEach((block) => block.classList.remove("on", "flash"));
  demoProgress.textContent = "0/5";
  setTyping(false);
}

let demoRun = 0;
let demoVisible = false;

async function playDemo() {
  const run = ++demoRun;
  const active = () => run === demoRun && demoVisible;
  resetDemo();
  await wait(700);
  for (const message of demoMessages) {
    if (!active()) return;
    if (message.from === "v") {
      setTyping(true);
      await wait(1150);
      if (!active()) return;
      setTyping(false);
    } else {
      await wait(1000);
      if (!active()) return;
    }
    demoChat.insertAdjacentHTML("beforeend", bubbleHtml(message));
    if (message.blocks) {
      await wait(450);
      if (!active()) return;
      fillBlocks(message.blocks);
    }
    await wait(message.from === "v" ? 900 : 650);
  }
  await wait(5200);
  if (active()) playDemo();
}

if (reduceMotion) {
  demoChat.innerHTML = demoMessages.map(bubbleHtml).join("");
  fillBlocks(canvasBlocks.map((block) => block.key));
} else {
  whenVisible(demo, 0.25, (visible) => {
    const wasVisible = demoVisible;
    demoVisible = visible;
    if (visible && !wasVisible) playDemo();
  });
}

/* ---------- Como funciona: etapas que avançam sozinhas ---------- */
const stepsGrid = document.querySelector("#momentos");
const stepItems = [...stepsGrid.querySelectorAll(".mom-item")];
const scenes = [...stepsGrid.querySelectorAll(".cena")];
const stepDuration = 5200;
let currentStep = 0;
let stepTimer = 0;
let stepsVisible = false;
let stepsPaused = false;

function restartAnimation(element) {
  element.style.animation = "none";
  void element.offsetWidth;
  element.style.animation = "";
}

function showStep(index) {
  currentStep = index;
  stepItems.forEach((item, position) => {
    item.classList.toggle("on", position === index);
    item.classList.toggle("passado", position < index);
    const button = item.querySelector("button");
    if (position === index) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  scenes.forEach((scene, position) => {
    scene.classList.toggle("on", position === index);
    if (position === index) scene.querySelectorAll(".peca, .vxr-m, .vxr-call, .bloco").forEach(restartAnimation);
  });
  restartAnimation(stepItems[index].querySelector(".barra i"));
  scheduleNextStep();
}

function scheduleNextStep() {
  window.clearTimeout(stepTimer);
  if (!stepsVisible || stepsPaused || reduceMotion) return;
  stepTimer = window.setTimeout(() => showStep((currentStep + 1) % stepItems.length), stepDuration);
}

stepItems.forEach((item, index) => item.querySelector("button").addEventListener("click", () => showStep(index)));
stepsGrid.addEventListener("mouseenter", () => {
  stepsPaused = true;
  stepsGrid.classList.add("pausado");
  window.clearTimeout(stepTimer);
});
stepsGrid.addEventListener("mouseleave", () => {
  stepsPaused = false;
  stepsGrid.classList.remove("pausado");
  scheduleNextStep();
});
whenVisible(stepsGrid, 0.3, (visible) => {
  const wasVisible = stepsVisible;
  stepsVisible = visible;
  stepsGrid.classList.toggle("rodando", visible && !reduceMotion);
  if (visible && !wasVisible) showStep(currentStep);
  if (!visible) window.clearTimeout(stepTimer);
});

/* ---------- O que você recebe: abas de frameworks ---------- */
const frameworkTabs = [
  { key: "diag", title: "Diagnóstico", chapter: "02", free: true, heading: "Diagnóstico executivo", description: "Estágio, oportunidade, risco e prioridade atual da sua ideia." },
  { key: "emp", title: "Mapa de Empatia", chapter: "03", free: true, heading: "Cliente e Mapa de Empatia", description: "Quem sofre, quem usa e quem decide a compra." },
  { key: "pv", title: "Proposta de Valor", chapter: "04", free: true, heading: "Problema e proposta de valor", description: "A rotina a melhorar, a alternativa atual e o que te diferencia." },
  { key: "bmc", title: "Business Model Canvas", chapter: "06", free: true, heading: "Business Model Canvas", description: "Os nove blocos do modelo de negócio, na ordem em que a Vértice preenche." },
  { key: "mvp", title: "MVP", chapter: "07", badge: "Completo", heading: "Estratégia de MVP", description: "A menor entrega capaz de testar uso e valor antes de codar demais." },
  { key: "swot", title: "SWOT e riscos", chapter: "11", badge: "Completo", heading: "SWOT e riscos", description: "Fatores internos, externos e o risco que você precisa atacar primeiro." },
  { key: "plano", title: "Plano de ação", chapter: "12", badge: "Completo", heading: "Plano de ação em 12 semanas", description: "Etapas, entregáveis e o critério para avançar ou parar." },
];

const frameworkContent = {
  diag: { columns: 4, cards: [
    { title: "Estágio", items: [["Descoberta: sem piloto ou venda relatados", "D"]] },
    { title: "Oportunidade", items: [["Faltas são recorrentes e custam horário vago", "I"]] },
    { title: "Risco principal", variant: "risco", items: [["Demanda: nenhuma clínica pagou ainda", "V"]] },
    { title: "Prioridade atual", variant: "pv", items: [["Entrevistar 15 donas antes de codar", "R"]] },
  ], callout: ["Recomendação prioritária", "Nas próximas duas semanas, conseguir 5 demos com a agenda real da clínica. O marco não é ter o app pronto; é um compromisso concreto de piloto."] },
  emp: { columns: 3, cards: [
    { title: "Quem compra", items: [["Dona da clínica, que aprova a despesa", "D"]] },
    { title: "Quem usa", items: [["Recepcionista que confirma os horários", "I"]] },
    { title: "Vê e ouve", items: [["Agenda com buracos e pacientes que somem sem avisar", "D"]] },
    { title: "Pensa e sente", items: [["Medo de a IA soar robótica com a paciente", "V"]] },
    { title: "Dores", items: [["Recepção não dá conta de confirmar todo mundo", "D"]] },
    { title: "Ganhos", items: [["Agenda cheia sem contratar mais gente", "V"]] },
  ] },
  pv: { columns: 2, cards: [
    { title: "Problema do cliente", items: [["Paciente marca e não aparece", "D"]] },
    { title: "Alternativa atual", items: [["Recepcionista confirma um a um no WhatsApp", "I"]] },
    { title: "Proposta de valor", variant: "pv", items: [["IA confirma 24h antes e reagenda quem desmarca", "D"]] },
    { title: "Diferenciação", items: [["Feito para clínica de estética, não um chatbot genérico", "V"]] },
  ] },
  mvp: { columns: 3, cards: [
    { title: "Problema-alvo", items: [["Faltas sem aviso", "D"]] },
    { title: "Fluxo central", variant: "pv", items: [["Lembrete 24h antes → paciente confirma ou escolhe outro horário", "R"]] },
    { title: "Dentro do escopo", items: [["Confirmação, reagendamento e painel de faltas", "R"]] },
    { title: "Fora do escopo", items: [["Prontuário, pagamentos e integrações com várias agendas", "R"]] },
    { title: "Teste concierge", items: [["Confirmar manualmente por 2 semanas para 3 clínicas", "R"]] },
    { title: "Critério de sucesso", items: [["Faltas caem e a clínica aceita pagar", "V"]] },
  ] },
  swot: { columns: 2, cards: [
    { title: "Forças", items: [["Sabe construir o produto sozinho", "D"]] },
    { title: "Fraquezas", items: [["Nunca vendeu um SaaS", "D"]] },
    { title: "Oportunidades", items: [["Clínicas já atendem tudo pelo WhatsApp", "I"]] },
    { title: "Ameaças", variant: "risco", items: [["Regras e custo da API oficial do WhatsApp", "V"]] },
  ], callout: ["Risco acionável", "Levantar o custo por mensagem da API oficial antes de fixar o preço de R$ 99 por profissional."] },
  plano: { columns: 4, cards: [
    { title: "Semanas 1 a 4 · Descobrir", items: [["15 entrevistas com donas de clínica", "R"]] },
    { title: "Semanas 5 a 8 · Ofertar", items: [["Piloto pago com 3 clínicas", "R"]] },
    { title: "Semanas 9 a 12 · Entregar", items: [["MVP em uso na agenda real", "R"]] },
    { title: "Avançar ou não", variant: "pv", items: [["Seguir se 2 das 3 clínicas renovarem", "R"]] },
  ] },
};

const businessModelCanvas = [
  { area: "b-par", number: 8, title: "Parcerias-chave", items: [["API oficial do WhatsApp (BSP)", "V"], ["Softwares de agenda que as clínicas já usam", "V"]] },
  { area: "b-ati", number: 7, title: "Atividades-chave", items: [["Fluxos de confirmação e reagendamento", "V"], ["Onboarding assistido da recepção", "V"]] },
  { area: "b-rec", number: 6, title: "Recursos-chave", items: [["Motor de IA treinado para agenda", "V"]] },
  { area: "b-pro pv", number: 2, title: "Proposta de valor", items: [["Menos faltas: IA confirma e reagenda pelo WhatsApp", "V"], ["Recepção livre para atender quem está na clínica", "V"]] },
  { area: "b-rel", number: 4, title: "Relacionamento", items: [["Self-service com suporte no WhatsApp", "V"]] },
  { area: "b-can", number: 3, title: "Canais", items: [["Prospecção ativa no Instagram", "V"]] },
  { area: "b-seg", number: 1, title: "Segmentos de clientes", items: [["Clínicas de estética com 2 a 10 profissionais", "D"], ["Dona decide a compra", "D"]] },
  { area: "b-cus", number: 9, title: "Estrutura de custos", items: [["Mensagens do WhatsApp, IA e servidor", "V"]] },
  { area: "b-rct", number: 5, title: "Fontes de receita", items: [["Mensalidade por profissional (R$ 99)", "D"], ["Plano anual com desconto", "V"]] },
];

const seals = { D: "Declarado", I: "Inferido", V: "Validar", R: "Recomendado" };
const tabList = document.querySelector("#abas");
const frameworkChapter = document.querySelector("#fw-capitulo");
const frameworkTitle = document.querySelector("#fw-titulo");
const frameworkDescription = document.querySelector("#fw-descricao");
const frameworkPanel = document.querySelector("#fw-conteudo");
const frameworkLock = document.querySelector("#fw-trava");
const frameworkAction = document.querySelector("#fw-acao");

function sealHtml(code) {
  return `<span class="st st-${code}" title="${seals[code]}" aria-label="${seals[code]}">${code}</span>`;
}

function itemsHtml(items) {
  return items.map(([text, code]) => `<div class="it">${escapeHtml(text)}${sealHtml(code)}</div>`).join("");
}

function frameworkHtml(key) {
  if (key === "bmc") {
    return `<div class="bmc troca">${businessModelCanvas.map((block) => `<div class="bl ${block.area}"><h4><i>${block.number}</i>${block.title}</h4>${itemsHtml(block.items)}</div>`).join("")}</div>`;
  }
  const content = frameworkContent[key];
  const cards = content.cards.map((card) => `<div class="bl ${card.variant || ""}"><h4>${card.title}</h4>${itemsHtml(card.items)}</div>`).join("");
  const callout = content.callout ? `<div class="vxf-call"><b>${content.callout[0]}</b><p>${escapeHtml(content.callout[1])}</p></div>` : "";
  return `<div class="vxf troca"><div class="vxf-grid c${content.columns}">${cards}</div>${callout}</div>`;
}

function showFramework(key) {
  const tab = frameworkTabs.find((item) => item.key === key);
  tabList.querySelectorAll(".aba").forEach((button) => {
    const selected = button.dataset.aba === key;
    button.classList.toggle("on", selected);
    button.setAttribute("aria-selected", String(selected));
  });
  frameworkChapter.textContent = `Capítulo ${tab.chapter} de 14 · Relatório Vértice`;
  frameworkTitle.textContent = tab.heading;
  frameworkDescription.textContent = tab.description;
  frameworkPanel.innerHTML = frameworkHtml(key);
  frameworkLock.innerHTML = tab.free
    ? `<b>${tab.heading}</b> vem no seu primeiro relatório.`
    : `${lockIcon} <b>${tab.heading}</b> entra no relatório completo, montado a partir da mesma conversa.`;
  frameworkAction.href = tab.free ? whatsappUrl : checkoutUrl;
  frameworkAction.innerHTML = `${tab.free ? "Montar o meu" : "Ver relatório completo"} ${arrowIcon}`;
}

tabList.innerHTML = frameworkTabs.map((tab) => `
  <button type="button" role="tab" class="aba" data-aba="${tab.key}" aria-selected="false">
    <span><i class="aba-n">${tab.chapter}</i>${tab.title}</span>${tab.badge ? `<span class="sub">${tab.badge}</span>` : ""}
  </button>`).join("");
tabList.addEventListener("click", (event) => {
  const button = event.target.closest(".aba");
  if (button) showFramework(button.dataset.aba);
});
showFramework("diag");

/* ---------- Perguntas frequentes ---------- */
const questions = document.querySelectorAll(".faq .q");
questions.forEach((question) => {
  question.querySelector("button").addEventListener("click", () => {
    const opening = !question.classList.contains("on");
    questions.forEach((item) => {
      item.classList.remove("on");
      item.querySelector("button").setAttribute("aria-expanded", "false");
    });
    if (opening) {
      question.classList.add("on");
      question.querySelector("button").setAttribute("aria-expanded", "true");
    }
  });
});

/* ---------- Efeitos de vértices ---------- */
const svgNamespace = "http://www.w3.org/2000/svg";

// Constelação: pontos que se conectam quando próximos e reagem ao cursor
function vertexNetwork(section) {
  if (!section) return;
  const canvas = document.createElement("canvas");
  canvas.className = "vx-net";
  canvas.setAttribute("aria-hidden", "true");
  section.insertBefore(canvas, section.firstChild);
  const context = canvas.getContext("2d");
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let points = [];
  let mouseX = -9999;
  let mouseY = -9999;
  let visible = false;
  let frame = 0;

  function measure() {
    width = section.clientWidth;
    height = section.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.round(Math.min(90, Math.max(28, (width * height) / 16000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() < 0.12 ? 2.4 : 1.4,
    }));
    if (reduceMotion) draw();
  }

  function draw() {
    const linkDistance = 130;
    context.clearRect(0, 0, width, height);
    points.forEach((a, i) => {
      if (!reduceMotion) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
        const dx = a.x - mouseX;
        const dy = a.y - mouseY;
        const distance = Math.hypot(dx, dy);
        if (distance < 140 && distance > 0) {
          a.x += (dx / distance) * 0.6;
          a.y += (dy / distance) * 0.6;
        }
      }
      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < linkDistance) {
          context.strokeStyle = `rgba(108,246,0,${0.22 * (1 - distance / linkDistance)})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }
    });
    points.forEach((a) => {
      const distance = Math.hypot(a.x - mouseX, a.y - mouseY);
      if (distance < 180) {
        context.strokeStyle = `rgba(108,246,0,${0.5 * (1 - distance / 180)})`;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(mouseX, mouseY);
        context.stroke();
      }
      context.fillStyle = a.r > 2 ? "rgba(108,246,0,.9)" : "rgba(241,255,240,.45)";
      context.beginPath();
      context.arc(a.x, a.y, a.r, 0, 7);
      context.fill();
      if (a.r > 2) {
        context.fillStyle = "rgba(108,246,0,.12)";
        context.beginPath();
        context.arc(a.x, a.y, 7, 0, 7);
        context.fill();
      }
    });
  }

  function loop() {
    if (!visible) {
      frame = 0;
      return;
    }
    draw();
    frame = requestAnimationFrame(loop);
  }

  section.addEventListener("pointermove", (event) => {
    const rect = section.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });
  section.addEventListener("pointerleave", () => {
    mouseX = -9999;
    mouseY = -9999;
  });
  whenVisible(section, 0, (isVisible) => {
    visible = isVisible;
    if (visible && !reduceMotion && !frame) frame = requestAnimationFrame(loop);
  });
  if (window.ResizeObserver) new ResizeObserver(measure).observe(section);
  measure();
  requestAnimationFrame(() => canvas.classList.add("on"));
}

// Divisor: linha quebrada entre seções, desenhada ao entrar na tela
function vertexDivider(section, index) {
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("class", "vx-div");
  svg.setAttribute("viewBox", "0 0 1000 36");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  svg.style.setProperty("--len", "1400");
  const heights = [18, 6, 28, 10, 24, 4, 20];
  const positions = [0, 140, 310, 470, 640, 820, 1000];
  const points = positions.map((x, i) => [x, heights[(i + (index % 3)) % heights.length]]);
  const line = document.createElementNS(svgNamespace, "polyline");
  line.setAttribute("points", points.map((point) => point.join(",")).join(" "));
  line.setAttribute("vector-effect", "non-scaling-stroke");
  svg.appendChild(line);
  points.slice(1, -1).forEach(([x, y], i) => {
    const circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", i % 2 ? 2 : 3);
    circle.style.transitionDelay = `${0.25 + i * 0.18}s`;
    svg.appendChild(circle);
    if (i === 2) {
      const halo = circle.cloneNode();
      halo.setAttribute("class", "halo");
      svg.appendChild(halo);
    }
  });
  section.parentNode.insertBefore(svg, section);
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    svg.classList.add("on");
    observer.disconnect();
  }, { threshold: 0.4 });
  observer.observe(svg);
}

vertexNetwork(document.querySelector("#topo"));
vertexNetwork(document.querySelector(".stage.final"));
if ("IntersectionObserver" in window) document.querySelectorAll("section.sec:not(.hero)").forEach(vertexDivider);
