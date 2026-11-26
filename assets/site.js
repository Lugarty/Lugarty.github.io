(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const progress = document.querySelector(".scroll-progress");
  const links = [...document.querySelectorAll(".nav > a[href^='#']")];
  const sections = links.map(link => document.querySelector(link.getAttribute("href")));
  let frame = 0;
  function updateScroll() {
    frame = 0;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0) + ")";
    const header = document.querySelector(".site-header");
    const threshold = (header ? header.offsetHeight : 0) + 120;
    let current = -1;
    sections.forEach((section, index) => { if (section && section.getBoundingClientRect().top <= threshold) current = index; });
    if (total > 0 && window.scrollY >= total - 8) current = links.length - 1;
    links.forEach((link, index) => index === current ? link.setAttribute("aria-current", "location") : link.removeAttribute("aria-current"));
  }
  function requestScrollUpdate() { if (!frame) frame = requestAnimationFrame(updateScroll); }
  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate, { passive: true });
  updateScroll();

  if (!reduced.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".section-head, .project, .principle, .info-card").forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) observer.observe(element);
    });
  }
  if (!reduced.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".project, .principle, .info-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", (event.clientX - rect.left) + "px");
        card.style.setProperty("--spot-y", (event.clientY - rect.top) + "px");
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--spot-x");
        card.style.removeProperty("--spot-y");
      });
    });
  }

  const demo = document.querySelector(".demo");
  if (!demo) return;
  const pt = document.documentElement.lang.toLowerCase().startsWith("pt");
  const labels = pt ? {
    ready: "Pronto", running: "Executando", approval: "Aguardando aprovação", complete: "Concluído",
    idle: "Escolha uma tarefa e inicie a simulação.", permission: "Aguardando autorização do usuário (simulada).",
    granted: "Autorização concedida na simulação.", done: "Simulação concluída. Nenhuma ação real foi executada."
  } : {
    ready: "Ready", running: "Running", approval: "Awaiting approval", complete: "Complete",
    idle: "Choose a task and start the simulation.", permission: "Awaiting user authorization (simulated).",
    granted: "Authorization granted in the simulation.", done: "Simulation complete. No real action was performed."
  };
  const scenarios = pt ? {
    browser: { description: "Consultar uma página pública e organizar os dados em um resumo.", steps: ["Interpretar a solicitação e selecionar uma ferramenta.", "Preparar uma ação de navegação via MCP.", "Simular a leitura da página e extrair informações.", "Conferir e apresentar o resumo ao usuário."] },
    files: { description: "Organizar arquivos de uma pasta de exemplo, sem tocar nos seus arquivos.", steps: ["Identificar a pasta e os critérios de organização.", "Preparar um plano de movimentação de arquivos.", "Simular a organização dos arquivos de exemplo.", "Verificar o resultado e apresentar o relatório."] },
    desktop: { description: "Preencher um formulário em um aplicativo fictício, mesmo sem API própria.", steps: ["Identificar o aplicativo e os campos necessários.", "Preparar a interação de mouse e teclado.", "Simular o preenchimento dos campos do aplicativo.", "Verificar o preenchimento e apresentar o resultado."] }
  } : {
    browser: { description: "Read a public web page and organize its information into a summary.", steps: ["Interpret the request and select a tool.", "Prepare a browser action via MCP.", "Simulate reading the page and extracting information.", "Verify and present the summary to the user."] },
    files: { description: "Organize files in an example folder without touching your actual files.", steps: ["Identify the folder and organization criteria.", "Prepare a file movement plan.", "Simulate organizing the example files.", "Verify the result and present the report."] },
    desktop: { description: "Complete a form in a fictional application, even without a dedicated API.", steps: ["Identify the application and required fields.", "Prepare mouse and keyboard interactions.", "Simulate filling in the application fields.", "Verify the entries and present the result."] }
  };
  const select = demo.querySelector(".demo-select");
  const run = demo.querySelector("[data-action='run']");
  const approve = demo.querySelector("[data-action='approve']");
  const reset = demo.querySelector("[data-action='reset']");
  const description = demo.querySelector(".demo-scenario");
  const status = demo.querySelector(".demo-status");
  const log = demo.querySelector(".demo-log");
  const meter = demo.querySelector(".demo-meter span");
  const feature = demo.closest(".feature");
  let timer = 0, phase = "ready", cursor = 0, activeScenario = null;
  function append(message, state) {
    const li = document.createElement("li");
    li.className = state;
    li.textContent = message;
    log.append(li);
    log.scrollTop = log.scrollHeight;
  }
  function state(next) {
    phase = next;
    feature.dataset.phase = next;
    status.textContent = labels[next === "working" ? "running" : next];
    const busy = next === "working" || next === "approval";
    select.disabled = busy;
    run.disabled = busy;
    approve.hidden = next !== "approval";
    reset.disabled = next === "ready";
  }
  function clearTimer() { if (timer) window.clearTimeout(timer); timer = 0; }
  function setProgress(value) { meter.style.width = value + "%"; }
  function resetDemo() {
    clearTimer();
    cursor = 0;
    activeScenario = null;
    log.replaceChildren();
    append(labels.idle, "");
    description.textContent = scenarios[select.value].description;
    setProgress(0);
    state("ready");
  }
  function nextStep() {
    if (phase !== "working" || !activeScenario) return;
    if (cursor >= activeScenario.steps.length) {
      append(labels.done, "done");
      setProgress(100);
      state("complete");
      return;
    }
    append(activeScenario.steps[cursor], "done");
    cursor++;
    setProgress(cursor * 22);
    if (cursor === 2) {
      append(labels.permission, "waiting");
      state("approval");
      return;
    }
    timer = window.setTimeout(nextStep, reduced.matches ? 20 : 690);
  }
  run.addEventListener("click", () => {
    if (phase === "working" || phase === "approval") return;
    clearTimer();
    log.replaceChildren();
    activeScenario = scenarios[select.value];
    cursor = 0;
    setProgress(0);
    state("working");
    timer = window.setTimeout(nextStep, reduced.matches ? 20 : 330);
  });
  approve.addEventListener("click", () => {
    if (phase !== "approval") return;
    append(labels.granted, "done");
    state("working");
    timer = window.setTimeout(nextStep, reduced.matches ? 20 : 350);
  });
  reset.addEventListener("click", resetDemo);
  select.addEventListener("change", resetDemo);
  resetDemo();
  demo.hidden = false;
})();
