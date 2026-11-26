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
    ready:"Pronto", working:"Executando", approval:"Revisão humana", complete:"Concluído", idle:"Inicie o cenário para acompanhar as ações.", review:"Controle entregue ao usuário. Confira o resultado antes de continuar.", approved:"Usuário confirmou a revisão. O agente retoma o fluxo.", finished:"Resultado conferido. Simulação concluída.", pending:"Não executado", saved:"Verificado", action:"Ação simulada", noChange:"Nenhuma alteração real.", browser:"Mensagens / exemplo", files:"Explorador de Arquivos · Windows", desktop:"Estoque / cadastro", to:"Destinatário", message:"Mensagem", draft:"Rascunho", sent:"Mensagem enviada · simulada", empty:"Aguardando preenchimento", record:"Registro", stock:"Quantidade", newValue:"Nova quantidade", verified:"Resultado confirmado", example:"Ambiente fictício"
  } : {
    ready:"Ready", working:"Running", approval:"Human review", complete:"Complete", idle:"Run the scenario to observe the actions.", review:"Control handed to the user. Review the result before continuing.", approved:"User confirmed the review. The agent resumes the workflow.", finished:"Outcome verified. Simulation complete.", pending:"Not executed", saved:"Verified", action:"Simulated action", noChange:"No real change.", browser:"Messages / example", files:"File Explorer · Windows", desktop:"Inventory / record", to:"Recipient", message:"Message", draft:"Draft", sent:"Message sent · simulated", empty:"Waiting for input", record:"Record", stock:"Quantity", newValue:"New quantity", verified:"Outcome confirmed", example:"Fictional environment"
  };
  const scenarios = pt ? {
    browser:{request:"Prepare uma mensagem para Marina no portal de contatos. Mostre o rascunho antes de enviar.",address:"portal.example / conversas / marina",steps:["Localizar a aba do portal e ler o formulário da conversa.","Preencher o rascunho e conferir o texto no campo.","Retomar a mesma conversa após a aprovação e acionar o envio.","Ler a conversa novamente e confirmar que a mensagem apareceu."]},
    files:{requiresReview:false,request:"Organize minha pasta Downloads no Windows. Separe os arquivos em Documentos, Imagens e Compactados, sem excluir nada.",address:"C:\\Users\\Usuario\\Downloads",steps:["Listar os arquivos da pasta Downloads e identificar seus tipos.","Criar as subpastas Documentos, Imagens e Compactados.","Mover cada arquivo para sua subpasta, preservando nomes e conteúdo.","Conferir os destinos e confirmar que os três arquivos foram preservados."]},
    desktop:{requiresReview:false,request:"No aplicativo de estoque, altere a quantidade do item CAB-01 de 12 para 18. (Como o usuário não solicitou uma revisão prévia neste cenário, o agente entende que pode executar a tarefa diretamente, sem apresentar o cadastro para aprovação.)",address:"Windows / Estoque / CAB-01",steps:["Identificar a janela do estoque e o campo de quantidade.","Simular mouse e teclado para preencher 18 e conferir o valor.","Salvar o cadastro diretamente, sem solicitar revisão prévia.","Reexaminar o item e verificar que a quantidade exibida é 18."]}
  } : {
    browser:{request:"Prepare a message to Marina in the contacts portal. Show the draft before sending it.",address:"portal.example / conversations / marina",steps:["Locate the portal tab and read the conversation form.","Fill the draft and verify the text in the field.","Resume the same conversation after approval and trigger send.","Read the conversation again and confirm that the message appeared."]},
    files:{requiresReview:false,request:"Organize my Downloads folder on Windows. Sort files into Documents, Images and Archives without deleting anything.",address:"C:\\Users\\User\\Downloads",steps:["List the files in Downloads and identify their types.","Create the Documents, Images and Archives subfolders.","Move each file into its subfolder, preserving its name and contents.","Check each destination and confirm that all three files were preserved."]},
    desktop:{requiresReview:false,request:"In the inventory application, update item CAB-01 from 12 to 18 units. (Since the user did not request a prior review in this scenario, the agent understands it can carry out the task directly, without presenting the record for approval.)",address:"Windows / Inventory / CAB-01",steps:["Identify the inventory window and quantity field.","Simulate mouse and keyboard input to enter 18, then verify the value.","Save the record directly, without requesting a prior review.","Inspect the item again and verify that the displayed quantity is 18."]}
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
    }else if(key==="files"){
      const items=[
        {name:pt?"contrato.pdf":"contract.pdf",type:"PDF",folder:pt?"Documentos":"Documents"},
        {name:pt?"captura.png":"screenshot.png",type:"PNG",folder:pt?"Imagens":"Images"},
        {name:pt?"projeto.zip":"project.zip",type:"ZIP",folder:pt?"Compactados":"Archives"}
      ];
      body.append(make("h5","mock-app-title","Downloads"));
      if(!submitted){
        items.forEach(item=>row(item.name,cursor>=1?item.type:(pt?"Arquivo":"File"),cursor>=1&&!edited));
        if(edited){
          body.append(make("span","mock-label",pt?"Subpastas criadas":"Subfolders created"));
          items.forEach(item=>row("▸ "+item.folder,pt?"Vazia":"Empty",true));
        }
      }else{
        body.append(make("span","mock-label",pt?"Arquivos nos novos destinos":"Files in their new locations"));
        items.forEach(item=>row("▸ "+item.folder+"/"+item.name,verified?T.saved:T.action,true));
        if(verified)row(pt?"3 arquivos preservados":"3 files preserved",pt?"0 excluídos":"0 deleted",true);
      }
    }else{
      body.append(make("h5","mock-app-title",pt?"Cadastro de estoque":"Inventory record"));field(T.record,"CAB-01 · USB-C");field(T.stock,submitted?"18":"12",submitted);
      if(edited&&!submitted)field(T.newValue,"18",true);row(pt?"Situação":"Status",verified?T.verified:submitted?T.action:edited?T.draft:T.pending,verified);
    }
    footer.dataset.state=phase;footer.textContent=phase==="approval"?T.review:phase==="complete"?T.finished:T.example+" · "+T.noChange;
  }
  function appendLog(message,state){log.append(make("li",state,message));log.scrollTop=log.scrollHeight;}
  function setDemoProgress(v){meter.setAttribute("aria-valuenow",String(v));bar.style.width=v+"%";}
  function setState(next){phase=next;feature.dataset.phase=next;status.textContent=T[next];const busy=next==="working"||next==="approval";tabs.forEach(tab=>{tab.disabled=busy;tab.setAttribute("aria-pressed",String(tab.dataset.scenario===key));});run.disabled=busy;approve.hidden=next!=="approval";reset.disabled=next==="ready";showWorkspace();}
  function clearTimer(){if(timer)window.clearTimeout(timer);timer=0;}
  function resetDemo(){clearTimer();cursor=0;log.replaceChildren();appendLog(T.idle,"");description.textContent=scenarios[key].request;setDemoProgress(0);setState("ready");}
  function nextStep(){if(phase!=="working")return;if(cursor>=4){appendLog(T.finished,"done");setDemoProgress(100);setState("complete");return;}appendLog(scenarios[key].steps[cursor],"done");cursor++;setDemoProgress(cursor*23);showWorkspace();if(cursor===2&&scenarios[key].requiresReview!==false){appendLog(T.review,"waiting");setState("approval");return;}timer=window.setTimeout(nextStep,reduced.matches?30:1000);}
  tabs.forEach(tab=>tab.addEventListener("click",()=>{if(phase==="working"||phase==="approval")return;key=tab.dataset.scenario;resetDemo();}));
  run.addEventListener("click",()=>{if(phase==="working"||phase==="approval")return;clearTimer();cursor=0;log.replaceChildren();setDemoProgress(0);setState("working");timer=window.setTimeout(nextStep,reduced.matches?30:420);});
  approve.addEventListener("click",()=>{if(phase!=="approval")return;appendLog(T.approved,"done");setState("working");timer=window.setTimeout(nextStep,reduced.matches?30:420);});
  reset.addEventListener("click",resetDemo);resetDemo();demo.hidden=false;
})();
