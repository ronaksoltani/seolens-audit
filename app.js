/* SEO Lens | dependency-free browser interactions | MIT License */ "use strict";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [
  ...root.querySelectorAll(selector)
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#39;"
}
[
  char
]));
const toast = message =>{
   const node = $(".toast");
   if (!node) return;
   node.textContent = message;
   node.classList.add("is-visible");
   clearTimeout(window.toastTimer);
   window.toastTimer = setTimeout(() => node.classList.remove("is-visible"), 2600);
};
const downloadText = (filename, text, type = "text/plain;charset=utf-8") =>{
   const url = URL.createObjectURL(new Blob([
    text
  ],{
    type
  }));
   const link = document.createElement("a");
   link.href = url;
   link.download = filename;
   link.click();
   setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const copyText = async text =>{
   try{
     await navigator.clipboard.writeText(text);
     return true;
  }
   catch{
     const field = document.createElement("textarea");
     field.value = text;
     field.style.position = "fixed";
     field.style.opacity = "0";
     document.body.append(field);
     field.select();
     const ok = document.execCommand("copy");
     field.remove();
     return ok;
  }
};
const readFileText = file => new Promise((resolve, reject) =>{
   const reader = new FileReader();
   reader.onload = () => resolve(String(reader.result));
   reader.onerror = () => reject(new Error("Could not read this file."));
   reader.readAsText(file);
});
const parseCSV = text =>{
   const rows = [
  ];
   let row = [
  ], cell = "", quoted = false;
   for (let i = 0; i < text.length; i++){
     const c = text[
      i
    ];
     if (quoted){
       if (c === '"' && text[
        i + 1
      ]
       === '"'){
         cell += '"';
         i++;
      }
       else if (c === '"') quoted = false;
       else cell += c;
    }
     else if (c === '"') quoted = true;
     else if (c === ","){
       row.push(cell);
       cell = "";
    }
     else if (c === "\n"){
       row.push(cell.replace(/\r$/, ""));
       if (row.some(value => value.trim())) rows.push(row);
       row = [
      ];
       cell = "";
    }
     else cell += c;
  }
   row.push(cell.replace(/\r$/, ""));
   if (row.some(value => value.trim())) rows.push(row);
   return rows;
};
const saveJSON = (key, value) =>{
   try{
     localStorage.setItem(key, JSON.stringify(value));
     return true;
  }
   catch{
     return false;
  }
};
const loadJSON = (key, fallback) =>{
   try{
     return JSON.parse(localStorage.getItem(key)) ?? fallback;
  }
   catch{
     return fallback;
  }
};
const menuButton = $(".menu-toggle"), nav = $("#main-navigation");
menuButton?.addEventListener("click", () =>{
   const opened = nav.classList.toggle("is-open");
   menuButton.setAttribute("aria-expanded", String(opened));
   menuButton.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
});
nav?.addEventListener("click", event =>{
   if (event.target.closest("a")){
     nav.classList.remove("is-open");
     menuButton?.setAttribute("aria-expanded", "false");
  }
});
$$('[data-toast]').forEach(button => button.addEventListener("click", () => toast(button.dataset.toast)));
$$('[data-scroll]').forEach(button => button.addEventListener("click", () => $(button.dataset.scroll)?.scrollIntoView({
  behavior:"smooth"
})));
const runAudit=()=>{
  const source=$("#source-html").value;
  if(!source.trim()){
    toast("Paste HTML to start the audit.");
    return;
  }
  const doc=new DOMParser().parseFromString(source,"text/html"),title=(doc.querySelector("title")?.textContent||"").trim(),description=(doc.querySelector('meta[name="description"]')?.content||"").trim(),h1=[
    ...doc.querySelectorAll("h1")
  ],images=[
    ...doc.querySelectorAll("img")
  ],canonical=doc.querySelector('link[rel="canonical"]')?.href||"",lang=doc.documentElement.getAttribute("lang")||"",viewport=doc.querySelector('meta[name="viewport"]'),robots=doc.querySelector('meta[name="robots"]')?.content||"";
  const checks=[
{
      name:"Page title",
      ok:title.length>0,
      priority:"HIGH",
      detail:title?title.length+" characters. Make it distinct and descriptive.":"Add one clear title element to describe this page."
    },
{
      name:"Meta description",
      ok:description.length>0,
      priority:"HIGH",
      detail:description?description.length+" characters. Check it summarizes this page accurately.":"Write a useful description for searchers; it is a snippet candidate, not a ranking guarantee."
    },
{
      name:"Main heading",
      ok:h1.length===1,
      priority:"MEDIUM",
      detail:h1.length===1?"One H1 found.":h1.length===0?"No H1 found. Give the main topic a clear page heading.":h1.length+" H1s found. Review the content hierarchy."
    },
{
      name:"Image alternatives",
      ok:images.every(image=>image.hasAttribute("alt")),
      priority:"MEDIUM",
      detail:images.length===0?"No images found.":images.filter(image=>!image.hasAttribute("alt")).length?images.filter(image=>!image.hasAttribute("alt")).length+" images have no alt attribute.":"All "+images.length+" images have an alt attribute."
    },
{
      name:"Canonical URL",
      ok:Boolean(canonical),
      priority:"LOW",
      detail:canonical?"Canonical URL is declared; verify it points to the preferred page.":"No canonical URL found. Add one if this page has equivalent duplicates."
    },
{
      name:"Document language",
      ok:Boolean(lang),
      priority:"LOW",
      detail:lang?"Language is declared as "+lang+".":"Add a language attribute to the html element."
    },
{
      name:"Viewport",
      ok:Boolean(viewport),
      priority:"MEDIUM",
      detail:viewport?"Viewport metadata is present.":"Add viewport metadata for a mobile-friendly layout."
    },
{
      name:"Indexing directive",
      ok:!/(noindex|none)/i.test(robots),
      priority:"HIGH",
      detail:/(noindex|none)/i.test(robots)?"A noindex directive was found. Confirm that this page should stay out of search results.":robots?"Robots directive: "+robots:"No page-level noindex directive found."
    }
  ];
  const score=Math.round(checks.filter(item=>item.ok).length/checks.length*100);
  $("#audit-score").textContent=score+" / 100";
  $("#audit-results").innerHTML='<div class="audit-list">'+checks.map(item=>'<article class="audit-item"><span class="audit-mark '+(item.ok?'':'warn')+'">'+(item.ok?'✓':'!')+'</span><div><h4>'+escapeHTML(item.name)+'</h4><p>'+escapeHTML(item.detail)+'</p></div><span class="priority">'+item.priority+'</span></article>').join("")+'</div>';
};
$("#run-audit")?.addEventListener("click",runAudit);
$("#clear-audit")?.addEventListener("click",()=>{
  $("#source-html").value="";
  $("#audit-score").textContent="— / 100";
  $("#audit-results").innerHTML='<div class="empty-state"><span class="empty-icon">⌕</span><h3>Your checklist is ready.</h3><p>Run the audit to see prioritized checks and suggestions.</p></div>';
});
runAudit();
