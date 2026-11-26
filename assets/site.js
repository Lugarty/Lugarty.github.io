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


  const demo = document.querySelector(".mission-demo");
  if (!demo) return;
  const pt = document.documentElement.lang.toLowerCase().startsWith("pt");
  const T = pt ? {
    ready:"Pronto", working:"Executando", approval:"Revisão humana", complete:"Concluído", idle:"Inicie o cenário para acompanhar as ações.", review:"Controle entregue ao usuário. Confira o resultado antes de continuar.", approved:"Usuário confirmou a revisão. O agente retoma o fluxo.", finished:"Resultado conferido. Simulação concluída.", pending:"Não executado", saved:"Verificado", action:"Ação simulada", noChange:"Nenhuma alteração real.", browser:"Mensagens / exemplo", background:"Estoque · Desktop privado", foreground:"Editor de texto · Desktop do usuário", foregroundApproval:"Autorização de entrada", foregroundReview:"O agente pede autorização para usar o mouse e o teclado em primeiro plano. Nenhuma entrada foi enviada.", foregroundApproved:"Usuário autorizou a entrada em primeiro plano. O agente pode interagir com a janela.", foregroundButton:"Autorizar mouse e teclado", reviewButton:"Aprovar e continuar", to:"Destinatário", message:"Mensagem", draft:"Rascunho", sent:"Mensagem enviada · simulada", empty:"Aguardando preenchimento", record:"Registro", stock:"Quantidade", newValue:"Nova quantidade", verified:"Resultado confirmado", example:"Ambiente fictício"
  } : {
    ready:"Ready", working:"Running", approval:"Human review", complete:"Complete", idle:"Run the scenario to observe the actions.", review:"Control handed to the user. Review the result before continuing.", approved:"User confirmed the review. The agent resumes the workflow.", finished:"Outcome verified. Simulation complete.", pending:"Not executed", saved:"Verified", action:"Simulated action", noChange:"No real change.", browser:"Messages / example", background:"Inventory · Private desktop", foreground:"Text editor · User desktop", foregroundApproval:"Input authorization", foregroundReview:"The agent requests permission to use the mouse and keyboard in the foreground. No input has been sent.", foregroundApproved:"The user authorized foreground input. The agent can now interact with the window.", foregroundButton:"Authorize mouse and keyboard", reviewButton:"Approve and continue", to:"Recipient", message:"Message", draft:"Draft", sent:"Message sent · simulated", empty:"Waiting for input", record:"Record", stock:"Quantity", newValue:"New quantity", verified:"Outcome confirmed", example:"Fictional environment"
  };
  const scenarios = pt ? {
    browser:{request:"Prepare uma mensagem para Marina no portal de contatos. Mostre o rascunho antes de enviar.",address:"portal.example / conversas / marina",steps:["Localizar a aba do portal e ler o formulário da conversa.","Preencher o rascunho e conferir o texto no campo.","Retomar a mesma conversa após a aprovação e acionar o envio.","Ler a conversa novamente e confirmar que a mensagem apareceu."]},
    background:{requiresReview:false,request:"Abra o aplicativo de estoque em segundo plano e altere a quantidade do item CAB-01 de 12 para 18. (Como não foi solicitada revisão prévia neste cenário, o agente executa a tarefa diretamente.)",address:"Windows / Desktop privado / Estoque",steps:["Abrir o aplicativo em uma área de trabalho privada, sem tomar o foco do usuário.","Identificar os controles pela UI Automation, preencher 18 e conferir o valor.","Acionar Salvar pelo controle do aplicativo, sem usar o mouse ou teclado físicos.","Reexaminar o cadastro e confirmar a quantidade 18, preservando o foco do usuário."]},
    foreground:{request:"No editor de texto aberto no meu Windows, altere o horário da reunião de 14h para 15h e salve a nota.",address:"Windows / Desktop do usuário / Editor de texto",steps:["Localizar a janela do editor e identificar o campo de texto.","Ler a nota e preparar a alteração, sem enviar entrada física.","Após autorização, trazer a janela ao primeiro plano, clicar no texto, digitar o novo horário e salvar com Ctrl+S.","Reler o texto e verificar que a nota contém o horário de 15h."]}
  } : {
    browser:{request:"Prepare a message to Marina in the contacts portal. Show the draft before sending it.",address:"portal.example / conversations / marina",steps:["Locate the portal tab and read the conversation form.","Fill the draft and verify the text in the field.","Resume the same conversation after approval and trigger send.","Read the conversation again and confirm that the message appeared."]},
    background:{requiresReview:false,request:"Open the inventory application in the background and update item CAB-01 from 12 to 18 units. (Since no prior review was requested in this scenario, the agent carries out the task directly.)",address:"Windows / Private desktop / Inventory",steps:["Open the application on a private desktop without taking the user’s focus.","Identify the controls with UI Automation, enter 18 and verify the value.","Invoke Save through the application control without using the physical mouse or keyboard.","Inspect the record again and confirm the quantity is 18, preserving the user’s focus."]},
    foreground:{request:"In the text editor open on my Windows desktop, change the meeting time from 2 PM to 3 PM and save the note.",address:"Windows / User desktop / Text editor",steps:["Locate the editor window and identify the text field.","Read the note and prepare the change without sending physical input.","After authorization, bring the window to the foreground, click the text, type the new time and save with Ctrl+S.","Read the text again and verify that the note contains the 3 PM meeting time."]}
  };
  const tabs=[...demo.querySelectorAll(".scenario-tab")],run=demo.querySelector("[data-action='run']"),approve=demo.querySelector("[data-action='approve']"),reset=demo.querySelector("[data-action='reset']"),description=demo.querySelector(".demo-scenario"),status=demo.querySelector(".demo-status"),log=demo.querySelector(".demo-log"),meter=demo.querySelector(".demo-meter"),bar=meter.querySelector("span"),title=demo.querySelector(".mock-title"),address=demo.querySelector(".mock-address"),body=demo.querySelector(".mock-body"),footer=demo.querySelector(".mock-footer"),feature=demo.closest(".feature");
  let key="browser",phase="ready",cursor=0,timer=0;
  const make=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;};
  function field(label,value,changed=false,multiline=false){body.append(make("span","mock-label",label),make("div","mock-field"+(changed?" changed":"")+(multiline?" message":""),value));}
  function row(a,b,highlight=false){const r=make("div","mock-row"+(highlight?" highlight":""));r.append(make("strong","",a),make("span","",b));body.append(r);}
  function showWorkspace(){
    const edited=cursor>=2,submitted=cursor>=3,verified=cursor>=4;
    title.textContent=T[key];address.textContent=scenarios[key].address;body.replaceChildren();
    if(key==="browser"){
      body.append(make("h5","mock-app-title",pt?"Nova mensagem":"New message"));field(T.to,"Marina Costa");
      field(T.message,edited?(pt?"Olá, Marina! O relatório semanal está pronto para revisão.":"Hi, Marina! The weekly report is ready for review."):T.empty,edited&&!submitted,true);
      row(pt?"Estado":"Status",submitted?T.sent:edited?T.draft:T.pending,submitted);
    }else if(key==="background"){
      body.append(make("h5","mock-app-title",pt?"Cadastro de estoque":"Inventory record"));
      row(pt?"Área de trabalho":"Desktop",pt?"Privada · IO":"Private · IO",cursor>=1);
      field(T.record,"CAB-01 · USB-C");
      field(T.stock,edited?"18":"12",edited);
      row(pt?"Foco do usuário":"User focus",pt?"Preservado":"Preserved",cursor>=1);
      row(pt?"Situação":"Status",verified?T.verified:submitted?T.action:edited?T.draft:T.pending,verified);
    }else{
      body.append(make("h5","mock-app-title",pt?"Editor de texto · nota.txt":"Text editor · note.txt"));
      row(pt?"Área de trabalho":"Desktop",pt?"Principal · Windows":"Main · Windows",cursor>=3);
      field(pt?"Conteúdo da nota":"Note contents",submitted?(pt?"Reunião: 15h":"Meeting: 3 PM"):(pt?"Reunião: 14h":"Meeting: 2 PM"),submitted,true);
      row(pt?"Mouse e teclado":"Mouse and keyboard",phase==="approval"?(pt?"Aguardando autorização":"Awaiting authorization"):submitted?(pt?"Entrada autorizada":"Authorized input"):(pt?"Sem entrada física":"No physical input"),submitted);
      row(pt?"Situação":"Status",verified?T.verified:submitted?(pt?"Nota salva":"Note saved"):T.pending,verified);
    }
    footer.dataset.state=phase;footer.textContent=phase==="approval"?(key==="foreground"?T.foregroundReview:T.review):phase==="complete"?T.finished:T.example+" · "+T.noChange;
  }
  function appendLog(message,state){log.append(make("li",state,message));log.scrollTop=log.scrollHeight;}
  function setDemoProgress(v){meter.setAttribute("aria-valuenow",String(v));bar.style.width=v+"%";}
  function setState(next){phase=next;feature.dataset.phase=next;status.textContent=next==="approval"&&key==="foreground"?T.foregroundApproval:T[next];approve.textContent=key==="foreground"?T.foregroundButton:T.reviewButton;const busy=next==="working"||next==="approval";tabs.forEach(tab=>{tab.disabled=busy;tab.setAttribute("aria-pressed",String(tab.dataset.scenario===key));});run.disabled=busy;approve.hidden=next!=="approval";reset.disabled=next==="ready";showWorkspace();}
  function clearTimer(){if(timer)window.clearTimeout(timer);timer=0;}
  function resetDemo(){clearTimer();cursor=0;log.replaceChildren();appendLog(T.idle,"");description.textContent=scenarios[key].request;setDemoProgress(0);setState("ready");}
  function nextStep(){if(phase!=="working")return;if(cursor>=4){appendLog(T.finished,"done");setDemoProgress(100);setState("complete");return;}appendLog(scenarios[key].steps[cursor],"done");cursor++;setDemoProgress(cursor*23);showWorkspace();if(cursor===2&&scenarios[key].requiresReview!==false){appendLog(key==="foreground"?T.foregroundReview:T.review,"waiting");setState("approval");return;}timer=window.setTimeout(nextStep,reduced.matches?30:1000);}
  tabs.forEach(tab=>tab.addEventListener("click",()=>{if(phase==="working"||phase==="approval")return;key=tab.dataset.scenario;resetDemo();}));
  run.addEventListener("click",()=>{if(phase==="working"||phase==="approval")return;clearTimer();cursor=0;log.replaceChildren();setDemoProgress(0);setState("working");timer=window.setTimeout(nextStep,reduced.matches?30:420);});
  approve.addEventListener("click",()=>{if(phase!=="approval")return;appendLog(key==="foreground"?T.foregroundApproved:T.approved,"done");setState("working");timer=window.setTimeout(nextStep,reduced.matches?30:420);});
  reset.addEventListener("click",resetDemo);resetDemo();demo.hidden=false;
})();
