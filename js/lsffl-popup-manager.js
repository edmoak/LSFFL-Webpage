(function(){"use strict";if(window.top!==window.self){return;}var YEAR="2026";var LEAGUE_ID="23135";var MFL_ORIGIN="https://www48.myfantasyleague.com";(function preHideLegacyNotification(){var style=document.createElement("style");style.id="lsffl-popup47-native-notification-guard";style.textContent="#MFLPlayerPopupNotificationContainer{"+"display:none!important;"+"visibility:hidden!important;"+"opacity:0!important;"+"}";(document.head||document.documentElement).appendChild(style);})();var modal=null;var modalDialog=null;var modalFrame=null;var modalTitle=null;var modalClose=null;var modalType="content";var previousFocus=null;var ANNOUNCEMENT_SESSION_KEY="lsffl-popup47-week3-auto-shown-2026-23135";var ANNOUNCEMENT_DISMISS_KEY="lsffl-popup47-week3-dismissed-until";function absoluteUrl(value,base){try{return new URL(value,base||window.location.href);}catch(error){return null;}}function normalizeFranchiseId(value){var digits=String(value||"").replace(/\D/g,"");if(!digits){return"";}return digits.padStart(4,"0").slice(-4);}function isMfl2026(url){return Boolean(url&&/myfantasyleague\.com$/i.test(url.hostname)&&url.pathname.indexOf("/"+YEAR+"/")!==-1);}function classifyMflUrl(value){var url=absoluteUrl(value);if(!isMfl2026(url)){return null;}var option=String(url.searchParams.get("O")||"").replace(/^0+/,"");var franchiseId=normalizeFranchiseId(url.searchParams.get("F"));if(/\/options\/?$/i.test(url.pathname)&&option==="73"){return{type:"article",title:"League Article",url:url.href};}if(franchiseId&&/\/options\/?$/i.test(url.pathname)){return{type:"franchise",title:"Franchise Center",url:url.href};}return null;}function injectModalStyles(){if(document.getElementById("lsffl-popup47-modal-styles")){return;}var style=document.createElement("style");style.id="lsffl-popup47-modal-styles";style.textContent=["body.lsffl-popup47-open{"+"overflow:hidden!important;"+"}","#lsffl-popup47-modal[hidden]{"+"display:none!important;"+"}","#lsffl-popup47-modal{"+"position:fixed;"+"inset:0;"+"z-index:2147483000;"+"display:flex;"+"align-items:center;"+"justify-content:center;"+"padding:18px;"+"background:rgba(0,7,18,.86);"+"backdrop-filter:blur(4px);"+"-webkit-backdrop-filter:blur(4px);"+"}","#lsffl-popup47-dialog{"+"width:min(1180px,96vw);"+"height:min(850px,94vh);"+"display:flex;"+"flex-direction:column;"+"overflow:hidden;"+"border:2px solid #c9a227;"+"border-radius:11px;"+"background:#061426;"+"box-shadow:0 22px 70px rgba(0,0,0,.72);"+"}","#lsffl-popup47-bar{"+"min-height:48px;"+"display:flex;"+"align-items:center;"+"justify-content:space-between;"+"gap:16px;"+"padding:8px 10px 8px 15px;"+"border-bottom:2px solid #c9a227;"+"background:linear-gradient(180deg,#123755 0%,#071a2f 100%);"+"}","#lsffl-popup47-title{"+"min-width:0;"+"overflow:hidden;"+"color:#fff;"+"font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',Arial,sans-serif;"+"font-size:18px;"+"line-height:22px;"+"font-weight:800;"+"letter-spacing:.65px;"+"text-overflow:ellipsis;"+"text-transform:uppercase;"+"white-space:nowrap;"+"}","#lsffl-popup47-close{"+"-webkit-appearance:none!important;"+"appearance:none!important;"+"width:22px!important;"+"min-width:22px!important;"+"max-width:22px!important;"+"height:22px!important;"+"min-height:22px!important;"+"max-height:22px!important;"+"margin:0!important;"+"padding:0!important;"+"display:grid!important;"+"place-items:center!important;"+"border:0!important;"+"border-radius:3px!important;"+"outline:0!important;"+"background:#7c6b2a!important;"+"background-image:none!important;"+"color:#9ca3ac!important;"+"box-shadow:none!important;"+"cursor:pointer!important;"+"overflow:hidden!important;"+"}","#lsffl-popup47-close svg{"+"display:block!important;"+"width:11px!important;"+"height:11px!important;"+"fill:none!important;"+"stroke:currentColor!important;"+"stroke-width:3.2!important;"+"stroke-linecap:square!important;"+"pointer-events:none!important;"+"}","#lsffl-popup47-close:hover,"+"#lsffl-popup47-close:focus{"+"background:#8c792f!important;"+"color:#b5bbc2!important;"+"outline:none!important;"+"}","#lsffl-popup47-frame{"+"width:100%;"+"height:100%;"+"flex:1 1 auto;"+"border:0;"+"background:#061426;"+"opacity:0;"+"transition:opacity .12s ease;"+"}","@media(max-width:700px){"+"#lsffl-popup47-modal{"+"padding:7px;"+"}"+"#lsffl-popup47-dialog{"+"width:100%;"+"height:96vh;"+"border-radius:8px;"+"}"+"#lsffl-popup47-title{"+"font-size:16px;"+"}"+"}"].join("");document.head.appendChild(style);}function createModal(){if(modal){return;}injectModalStyles();modal=document.createElement("div");modal.id="lsffl-popup47-modal";modal.hidden=true;modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modalDialog=document.createElement("div");modalDialog.id="lsffl-popup47-dialog";var bar=document.createElement("div");bar.id="lsffl-popup47-bar";modalTitle=document.createElement("div");modalTitle.id="lsffl-popup47-title";modalTitle.textContent="LSFFL";modalClose=document.createElement("button");modalClose.id="lsffl-popup47-close";modalClose.type="button";modalClose.setAttribute("aria-label","Close popup");modalClose.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+'<path d="M6 6L18 18M18 6L6 18"></path>'+'</svg>';modalFrame=document.createElement("iframe");modalFrame.id="lsffl-popup47-frame";modalFrame.title="LSFFL content";modalFrame.setAttribute("loading","eager");bar.appendChild(modalTitle);bar.appendChild(modalClose);modalDialog.appendChild(bar);modalDialog.appendChild(modalFrame);modal.appendChild(modalDialog);document.body.appendChild(modal);modalClose.addEventListener("click",closeModal);modal.addEventListener("click",function(event){if(event.target===modal){closeModal();}});modalFrame.addEventListener("load",function(){cleanModalPage();window.setTimeout(cleanModalPage,75);window.setTimeout(cleanModalPage,200);window.setTimeout(cleanModalPage,450);window.setTimeout(cleanModalPage,900);window.setTimeout(function(){if(modalFrame){modalFrame.style.opacity="1";}},800);});}function hideElement(element){if(!element){return;}element.style.setProperty("display","none","important");element.style.setProperty("visibility","hidden","important");element.style.setProperty("height","0","important");element.style.setProperty("min-height","0","important");element.style.setProperty("margin","0","important");element.style.setProperty("padding","0","important");element.style.setProperty("overflow","hidden","important");}function hideMflChrome(doc){var selectors=[".myfantasyleague_menu","#myfantasyleague_menu",".mfl-menu",".mflmenu",".topmenu",".top-menu",".banner-container",".banner-container-wrap",".banner-leftside",".banner-rightside",".bannerlinkicons",".icon-bar",".lsffl-banner",".lsffl-header",".header-wrapper","#header","#pageheader","#MFLHeader","#mflheader",".pageheader",".page-header",".mfl-header",".ticker-wrapper",".lsffl-ticker-wrapper",".lsffl-scoreboard",".lsffl-scoreboard-shell",".scoreboard-wrapper",".scoreboard",".scoreboard-wrap","#scoreboard","#MFLScoreboard","#MFLScoreboardLoading","#body_ajax_ls",".lsb-scoreboard",".lsb-scoreboard-shell","[id*='scoreboard' i]","[class*='scoreboard' i]","#MFLBoxWrapper",".MFLSkinSelection","#menu-trigger","#menu-overlay","#click-blocker","#myfantasyleague_mobile_menu",".mobile-menu",".mobile_menu",".mobilemenu",".mfl-mobile-menu","#footer",".footer",".pagefooter","#pagefooter"];selectors.forEach(function(selector){Array.prototype.forEach.call(doc.querySelectorAll(selector),hideElement);});Array.prototype.forEach.call(doc.querySelectorAll("div,table,nav,section,header,ul"),function(node){if(!node||!node.textContent){return;}var textValue=String(node.textContent).replace(/\s+/g," ").trim();if(!textValue||textValue.length>1800){return;}if(/DIVISIONAL MATCHUPS/i.test(textValue)||/NON-DIVISIONAL MATCHUPS/i.test(textValue)||/LSFFL MATCHUPS/i.test(textValue)||/PLAYOFFS\s*[—-]\s*(QUARTERFINALS|SEMIFINALS)/i.test(textValue)||/LSFFL CHAMPIONSHIP/i.test(textValue)){var current=node;while(current&&current.parentElement&&current.parentElement!==doc.body){if(current.matches&&current.matches(".mobile-wrap,.homepagemodule,.module,.report,table,nav,header,section,"+".lsffl-scoreboard,.lsffl-scoreboard-shell,.lsb-scoreboard,.lsb-scoreboard-shell,"+".scoreboard,.scoreboard-wrap,[id*='scoreboard' i],[class*='scoreboard' i]")){break;}current=current.parentElement;}hideElement(current||node);}});var bannerPieces=doc.querySelectorAll(".banner-leftside,"+".banner-rightside,"+".bannerlinkicons");Array.prototype.forEach.call(bannerPieces,function(piece){var parent=piece.parentElement;if(parent&&parent!==doc.body){hideElement(parent);}});}function injectFrameTheme(doc){if(doc.getElementById("lsffl-popup47-frame-style")){return;}var style=doc.createElement("style");style.id="lsffl-popup47-frame-style";style.textContent=["html.lsffl-popup47-doc,"+"html.lsffl-popup47-doc body{"+"margin:0!important;"+"padding:0!important;"+"min-height:100%!important;"+"background:#061426!important;"+"background-image:url('https://github.com/edmoak/LSFFL-Webpage/blob/main/images/backgrounds/lsfflbackground.png?raw=true')!important;"+"background-position:center top!important;"+"background-size:cover!important;"+"background-attachment:fixed!important;"+"color:#fff!important;"+"overflow-x:hidden!important;"+"}","html.lsffl-popup47-doc body{"+"padding:10px!important;"+"box-sizing:border-box!important;"+"}","html.lsffl-popup47-doc #container-wrap,"+"html.lsffl-popup47-doc .pagebody,"+"html.lsffl-popup47-doc .report,"+"html.lsffl-popup47-doc .module{"+"max-width:100%!important;"+"width:100%!important;"+"margin:0 auto!important;"+"box-sizing:border-box!important;"+"}","html.lsffl-popup47-doc img{"+"max-width:100%!important;"+"height:auto!important;"+"}","html.lsffl-popup47-doc "+"body.lsffl-popup47-franchise "+"img.lsffl-popup47-team-logo{"+"display:block!important;"+"width:auto!important;"+"height:auto!important;"+"max-width:min(612px,75%)!important;"+"max-height:374px!important;"+"margin:10px auto 18px!important;"+"object-fit:contain!important;"+"}","html.lsffl-popup47-doc "+".lsffl-popup47-team-brand{"+"width:min(700px,92%)!important;"+"margin:18px auto 0!important;"+"text-align:center!important;"+"}","html.lsffl-popup47-doc "+".lsffl-popup47-team-name{"+"color:#fff!important;"+"font-family:'Oswald','Barlow Condensed','Arial Narrow',Arial,sans-serif!important;"+"font-size:clamp(28px,4vw,42px)!important;"+"line-height:1.05!important;"+"font-weight:800!important;"+"letter-spacing:1.2px!important;"+"text-transform:uppercase!important;"+"text-shadow:0 3px 8px rgba(0,0,0,.55)!important;"+"}","html.lsffl-popup47-doc "+".lsffl-popup47-team-line{"+"width:130px!important;"+"height:3px!important;"+"margin:10px auto 0!important;"+"background:linear-gradient("+"90deg,"+"transparent,"+"#c9a227,"+"#e1c45a,"+"#c9a227,"+"transparent"+")!important;"+"}"].join("");doc.head.appendChild(style);}function getFranchiseName(doc){if(!doc||!doc.body){return"";}var bodyText=String(doc.body.innerText||doc.body.textContent||"").replace(/\s+/g," ").trim();var navMatch=bodyText.match(/(?:^|\s)([A-Za-z0-9][A-Za-z0-9'’&. \/_-]{1,45}?):\s*Main\b/i);if(navMatch&&navMatch[1]){return navMatch[1].replace(/\s+/g," ").trim();}var rejected=/^(main|home|roster|roster w\/?stats|scoring history|transactions|schedule|accounting|series records|box score|my options|franchise center|league|standings|reports|players|draft|communications|league message board|message board|team|owner|record|points|power rank|all|submit|go)$/i;var candidates=Array.prototype.slice.call(doc.querySelectorAll(".modulehead,.moduleheader,.reportnavigation,h1,h2,h3,caption,th,td,strong,b"));for(var i=0;i<candidates.length;i+=1){var node=candidates[i];if(!node||!node.textContent){continue;}var text=String(node.textContent).replace(/\s+/g," ").replace(/:\s*Main.*$/i,"").trim();if(text.length<2||text.length>45||rejected.test(text)||/^(2026|LSFFL|LAMAD SQUAD)/i.test(text)||/\b(?:week|points|record|rank|division|league)\b/i.test(text)){continue;}var style;try{style=doc.defaultView.getComputedStyle(node);}catch(error){style=null;}if(style&&(style.display==="none"||style.visibility==="hidden")){continue;}if(/^[A-Z0-9][A-Z0-9'’&. \-_/]{1,44}$/.test(text)||node.matches(".modulehead,.moduleheader,h1,h2,h3,caption")){return text;}}var title=String(doc.title||"").replace(/MyFantasyLeague\.com/ig,"").replace(/2026/ig,"").replace(/LSFFL/ig,"").replace(/[|\-–—]+/g," ").replace(/\s+/g," ").trim();if(title.length>=2&&title.length<=45&&!rejected.test(title)){return title;}return"";}function decorateFranchise(doc){if(modalType!=="franchise"||!doc||!doc.body){return;}doc.body.classList.add("lsffl-popup47-franchise");if(doc.getElementById("lsffl-popup47-team-brand")){return;}var name=getFranchiseName(doc);if(!name){return;}if(modalTitle){modalTitle.textContent="Franchise Center — "+name;}var images=Array.prototype.slice.call(doc.querySelectorAll("img"));var logo=null;var bestScore=0;images.forEach(function(img){try{var style=doc.defaultView.getComputedStyle(img);var rect=img.getBoundingClientRect();if(style.display==="none"||style.visibility==="hidden"||rect.width<140||rect.height<80){return;}if(img.closest(".banner-container,.banner-container-wrap,.banner-leftside,.banner-rightside,.bannerlinkicons,.icon-bar,.myfantasyleague_menu,#header,#pageheader,#MFLHeader,.lsffl-header,.ticker-wrapper,.lsffl-ticker-wrapper,.lsffl-scoreboard,.scoreboard-wrapper")){return;}var nw=img.naturalWidth||rect.width;var nh=img.naturalHeight||rect.height;var ratio=nw/Math.max(nh,1);if(ratio>3.2){return;}var score=Math.max(nw*nh,rect.width*rect.height);if(score>bestScore){bestScore=score;logo=img;}}catch(error){}});if(!logo){return;}logo.classList.add("lsffl-popup47-team-logo");var brand=doc.createElement("div");brand.id="lsffl-popup47-team-brand";brand.className="lsffl-popup47-team-brand";var nameElement=doc.createElement("div");nameElement.className="lsffl-popup47-team-name";nameElement.textContent=name;var line=doc.createElement("div");line.className="lsffl-popup47-team-line";brand.appendChild(nameElement);brand.appendChild(line);if(logo.parentNode){logo.parentNode.insertBefore(brand,logo);}}function cleanDocumentTree(doc,win,depth){if(!doc||!doc.documentElement||!doc.body||depth>4){return;}doc.documentElement.classList.add("lsffl-popup47-doc");doc.body.classList.add("lsffl-popup47-doc");injectFrameTheme(doc);hideMflChrome(doc);if(!doc.documentElement.getAttribute("data-lsffl-popup47-chrome-watch")){doc.documentElement.setAttribute("data-lsffl-popup47-chrome-watch","1");var chromeObserver=new MutationObserver(function(){try{hideMflChrome(doc);}catch(error){}});chromeObserver.observe(doc.body,{childList:true,subtree:true});}decorateFranchise(doc);if(modalType==="franchise"){window.setTimeout(function(){try{decorateFranchise(doc);}catch(error){}},250);window.setTimeout(function(){try{decorateFranchise(doc);}catch(error){}},700);}var frames=Array.prototype.slice.call(doc.querySelectorAll("iframe,frame"));frames.forEach(function(nestedFrame){try{var nestedDoc=nestedFrame.contentDocument;var nestedWin=nestedFrame.contentWindow;if(nestedDoc&&nestedWin){cleanDocumentTree(nestedDoc,nestedWin,depth+1);}if(!nestedFrame.dataset.lsfflPopup41Cleaner){nestedFrame.dataset.lsfflPopup41Cleaner="1";nestedFrame.addEventListener("load",function(){window.setTimeout(function(){try{cleanDocumentTree(nestedFrame.contentDocument,nestedFrame.contentWindow,depth+1);}catch(error){}},30);});}}catch(error){}});}function cleanModalPage(){if(!modalFrame||!modalFrame.contentDocument||!modalFrame.contentWindow){return;}try{var doc=modalFrame.contentDocument;var win=modalFrame.contentWindow;if(!doc||!doc.documentElement||!doc.body){return;}cleanDocumentTree(doc,win,0);modalFrame.style.opacity="1";}catch(error){modalFrame.style.opacity="1";}}function openModal(url,type,title){createModal();previousFocus=document.activeElement;modalType=type||"content";modalTitle.textContent=title||"LSFFL";modalFrame.style.opacity="0";modalFrame.src=url;modal.hidden=false;document.body.classList.add("lsffl-popup47-open");window.setTimeout(function(){if(modalClose){modalClose.focus();}},0);return true;}function closeModal(){if(!modal||modal.hidden){return;}modal.hidden=true;modalFrame.src="about:blank";document.body.classList.remove("lsffl-popup47-open");if(previousFocus&&typeof previousFocus.focus==="function"){previousFocus.focus();}}function openFranchise(franchiseId){var id=normalizeFranchiseId(franchiseId);if(!id){return false;}return openModal(MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&F="+encodeURIComponent(id)+"&O=01","franchise","Franchise Center");}document.addEventListener("click",function(event){var link=event.target.closest("a[href]");if(announcementModal&&!announcementModal.hidden&&announcementModal.contains(event.target)){return;}if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.hasAttribute("download")){return;}var match=classifyMflUrl(link.href);if(!match){return;}event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();openModal(match.url,match.type,match.title);},true);window.addEventListener("message",function(event){var data=event.data;if(!data||data.type!=="LSFFL_OPEN_FRANCHISE"){return;}openFranchise(data.franchiseId);});document.addEventListener("click",function(event){var trigger=event.target.closest("[data-mfl-franchise]");if(!trigger){return;}var id=normalizeFranchiseId(trigger.getAttribute("data-mfl-franchise"));if(!id){return;}event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();openFranchise(id);},true);document.addEventListener("keydown",function(event){if(event.key==="Escape"&&modal&&!modal.hidden){closeModal();}});window.lsfflOpenContentPopup=function(url,title){var match=classifyMflUrl(url);if(!match){return false;}return openModal(match.url,match.type,title||match.title);};window.lsfflOpenFranchisePopup=openFranchise;window.lsfflCloseContentPopup=closeModal;var announcementModal=null;var announcementItems=[];var announcementIndex=0;function isHomepage(){var path=String(window.location.pathname||"");var query=new URLSearchParams(window.location.search||"");return(/\/2026\/home\/23135\/?$/i.test(path)||(/\/2026\/home\/?$/i.test(path)&&query.get("L")===LEAGUE_ID));}function cleanText(value){return String(value||"").replace(/\s+/g," ").trim();}function findSourceTable(id,moduleSelector){return(document.querySelector(moduleSelector+" table#"+id+","+moduleSelector+" table")||document.querySelector("table#"+id));}function firstUsableRow(table){if(!table){return null;}var rows=Array.prototype.slice.call(table.querySelectorAll("tr"));for(var i=0;i<rows.length;i+=1){var row=rows[i];var text=cleanText(row.textContent);if(!text){continue;}if(/view all articles|write new article/i.test(text)){continue;}if(row.querySelector("th")&&!row.querySelector("td")){continue;}if(row.querySelector("a[href]")){return row;}}return null;}function extractArticleAnnouncement(){var row=firstUsableRow(findSourceTable("article_summary",".lsffl-article-module"));if(!row){return null;}var link=row.querySelector("a[href]");var cells=row.querySelectorAll("td");var url=link?absoluteUrl(link.getAttribute("href"),window.location.href):null;return{eyebrow:"COMMISSIONER ARTICLE",title:cleanText(link?link.textContent:row.textContent)||"Commissioner Article",body:"A Commissioner Article is available in League Central.",meta:cells.length?cleanText(cells[cells.length-1].textContent):"",buttonText:"Open Full Article",buttonUrl:url?url.href:""};}function getNativeNotificationRoot(){return(document.getElementById("MFLPlayerPopupNotificationContainer")||document.getElementById("MFLPlayerPopupContainer"));}function nativeNotificationText(){var root=getNativeNotificationRoot();if(!root){return"";}return cleanText(root.innerText||root.textContent||"");}function findNativeNotificationLink(pattern){var root=getNativeNotificationRoot();if(!root){return"";}var links=Array.prototype.slice.call(root.querySelectorAll("a[href]"));for(var i=0;i<links.length;i+=1){var link=links[i];var haystack=cleanText((link.textContent||"")+" "+(link.getAttribute("href")||""));if(pattern.test(haystack)){var url=absoluteUrl(link.getAttribute("href"),window.location.href);return url?url.href:"";}}return"";}function ownerAlertCard(eyebrow,title,body,buttonText,buttonUrl){return{eyebrow:eyebrow,title:title,body:body,meta:"Owner Action Required",buttonText:buttonText,buttonUrl:buttonUrl};}function popupCurrentFranchiseId(){
  var candidates=[
    window.franchise_id,
    window.franchiseId,
    window.FRANCHISE_ID,
    window.logged_in_franchise_id,
    window.loggedInFranchiseId
  ];
  for(var i=0;i<candidates.length;i++){
    var id=normalizeFranchiseId(candidates[i]);
    if(id){return id;}
  }
  var links=Array.prototype.slice.call(document.querySelectorAll("a[href*='F=']"));
  for(var j=0;j<links.length;j++){
    var href=absoluteUrl(links[j].getAttribute("href"),window.location.href);
    if(!href){continue;}
    var text=cleanText(links[j].textContent);
    if(/\b(my team|my franchise|franchise home|roster)\b/i.test(text)){
      var linkId=normalizeFranchiseId(href.searchParams.get("F"));
      if(linkId){return linkId;}
    }
  }
  return"";
}
function ensurePopupLineupChecker(){
  if(document.getElementById("lsffl-popup47-lineup-source")){return;}
  var source=document.createElement("div");
  source.id="lsffl-popup47-lineup-source";
  source.setAttribute("aria-hidden","true");
  source.style.cssText="position:absolute!important;left:-99999px!important;top:-99999px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;";
  source.innerHTML='<div class="mobile-wrap InvalidLineupWrap"><table class="homepagemodule report" id="InvalidLineup" align="center" cellspacing="1"><caption><span>LINEUP ALERT</span></caption><tbody><tr class="invalid-teams" style="display:none"><th colspan="2">The Following Teams Have Invalid Lineups</th></tr><tr class="valid-teams" style="display:none"><th colspan="2">All Teams Have Valid Lineups</th></tr><tr class="reportfooter" style="display:none"><td colspan="2" align="center"></td></tr></tbody></table></div>';
  document.body.appendChild(source);
  window.donotcountBye=true;
  window.donotcountI=true;
  window.donotcountS=true;
  window.donotcountO=true;
  var script=document.createElement("script");
  script.src="https://www.mflscripts.com/mfl-apps/lineups/alert/script.js";
  script.async=true;
  script.id="lsffl-popup47-lineup-checker-script";
  document.body.appendChild(script);
}
function popupLineupCheckerReady(){
  var table=document.getElementById("InvalidLineup");
  if(!table){return false;}
  var valid=table.querySelector(".valid-teams");
  if(valid&&valid.style.display!=="none"){
    try{if(getComputedStyle(valid).display!=="none"){return true;}}catch(error){}
  }
  return table.querySelectorAll("tbody tr:not(.invalid-teams):not(.valid-teams):not(.reportfooter)").length>0;
}
function popupCurrentTeamHasInvalidLineup(){
  var table=document.getElementById("InvalidLineup");
  if(!table){return false;}
  var franchiseId=popupCurrentFranchiseId();
  if(!franchiseId){return false;}
  var rows=Array.prototype.slice.call(table.querySelectorAll("tbody tr:not(.invalid-teams):not(.valid-teams):not(.reportfooter)"));
  for(var i=0;i<rows.length;i++){
    var links=Array.prototype.slice.call(rows[i].querySelectorAll("a[href]"));
    for(var j=0;j<links.length;j++){
      var url=absoluteUrl(links[j].getAttribute("href"),window.location.href);
      if(url&&normalizeFranchiseId(url.searchParams.get("F"))===franchiseId){
        return true;
      }
    }
  }
  return false;
}
function extractOwnerManagerAlerts(){var text=nativeNotificationText();var alerts=[];if(popupCurrentTeamHasInvalidLineup()){alerts.push(ownerAlertCard("LINEUP ALERT","Starting Lineup Incomplete","The LSFFL lineup checker reports an invalid starting lineup for your team.","Fix Lineup",MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=02"));}if(!text){return alerts;}if(/\btrade\b/i.test(text)&&/\b(pending|proposal|proposed|offer|respond|response|approve|reject|accept)\b/i.test(text)){alerts.push(ownerAlertCard("TRADE ALERT","Trade Offer Pending","You have a trade proposal waiting for your attention.","View Trade",findNativeNotificationLink(/trade|O=0?5\b/i)||MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=05"));}if(/\b(injured reserve|injury reserve|\bIR\b)\b/i.test(text)&&/\b(illegal|invalid|ineligible|violation|must|remove|activate|error)\b/i.test(text)){alerts.push(ownerAlertCard("ROSTER ALERT","IR Violation","Your roster has an injured-reserve violation that needs to be corrected.","Fix IR",findNativeNotificationLink(/injured|reserve|\bIR\b/i)||MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=07"));}if(/\b(taxi|taxi squad|taxicab)\b/i.test(text)&&/\b(illegal|invalid|ineligible|violation|must|remove|activate|error)\b/i.test(text)){alerts.push(ownerAlertCard("ROSTER ALERT","Taxi Squad Violation","Your taxi squad has a violation that needs to be corrected.","Fix Taxi Squad",findNativeNotificationLink(/taxi/i)||MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=07"));}if(/\b(roster|players?|position)\b/i.test(text)&&/\b(illegal|invalid|violation|too many|too few|over limit|under limit|minimum|maximum|must|error)\b/i.test(text)&&!(/\b(injured reserve|injury reserve|\bIR\b)\b/i.test(text)&&alerts.some(function(item){return item.title==="IR Violation";}))){alerts.push(ownerAlertCard("ROSTER ALERT","Roster Violation","Your active roster does not currently meet the league roster requirements.","View Roster",findNativeNotificationLink(/roster|O=0?7\b/i)||MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=07"));}if(/\b(lineup|starter|starting lineup)\b/i.test(text)&&/\b(empty|missing|incomplete|illegal|invalid|violation|hole|must|submit|not submitted|error)\b/i.test(text)&&!alerts.some(function(item){return item.title==="Starting Lineup Incomplete";})){alerts.push(ownerAlertCard("LINEUP ALERT","Starting Lineup Incomplete","You have an empty or invalid starting-lineup position that needs attention.","Fix Lineup",findNativeNotificationLink(/lineup|starter/i)||MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=02"));}var seen=Object.create(null);return alerts.filter(function(item){if(seen[item.title]){return false;}seen[item.title]=true;return true;});}
var ownerDataSnapshot={
  ready:false,
  irTaxi:[],
  pendingTrades:0,
  rosterViolation:false
};

function popupAsArray(value){
  if(value===undefined||value===null){return[];}
  return Array.isArray(value)?value:[value];
}
function popupExportUrl(type,extra){
  var url=new URL(MFL_ORIGIN+"/"+YEAR+"/export");
  url.searchParams.set("TYPE",type);
  url.searchParams.set("L",LEAGUE_ID);
  url.searchParams.set("JSON","1");
  Object.keys(extra||{}).forEach(function(key){
    if(extra[key]!==undefined&&extra[key]!==null){
      url.searchParams.set(key,String(extra[key]));
    }
  });
  return url.href;
}
function popupFetchJSON(type,extra){
  return fetch(popupExportUrl(type,extra),{
    credentials:"same-origin",
    cache:"no-store"
  }).then(function(response){
    if(!response.ok){throw new Error(type+" failed "+response.status);}
    return response.json();
  });
}
function popupNormalizeRosterStatus(value){
  var raw=cleanText(value).toUpperCase();
  if(raw==="IR"||raw.indexOf("INJURED")!==-1||raw.indexOf("RESERVE")!==-1){return"IR";}
  if(raw==="TS"||raw.indexOf("TAXI")!==-1){return"TAXI";}
  return"";
}
function popupPlayerStatus(player){
  return cleanText(player&&(player.status||player.injuryStatus||player.injury_status))||"No injury designation";
}
function popupFindCurrentRoster(data,franchiseId){
  var root=data&&data.rosters?data.rosters:data;
  var teams=popupAsArray(root&&root.franchise);
  for(var i=0;i<teams.length;i++){
    if(normalizeFranchiseId(teams[i].id)===franchiseId){return teams[i];}
  }
  return null;
}
function popupPlayerMap(data){
  var map=Object.create(null);
  var root=data&&data.players?data.players:data;
  popupAsArray(root&&root.player).forEach(function(player){
    if(player&&player.id){map[String(player.id)]=player;}
  });
  return map;
}
function popupLivePlayerMap(data,franchiseId){
  var map=Object.create(null);
  var root=data&&data.liveScoring?data.liveScoring:data;
  popupAsArray(root&&root.matchup).forEach(function(matchup){
    popupAsArray(matchup&&matchup.franchise).forEach(function(team){
      if(normalizeFranchiseId(team&&team.id)!==franchiseId){return;}
      var players=team&&team.players?team.players:{};
      popupAsArray(players.player).forEach(function(player){
        if(player&&player.id){map[String(player.id)]=player;}
      });
    });
  });
  return map;
}
function popupPlayerHasPlayed(livePlayer){
  if(!livePlayer){return false;}
  var score=Number(livePlayer.score||0);
  var updated=cleanText(livePlayer.updatedStats||livePlayer.updated_stats||"");
  /*
   * Do NOT use kickoff alone. LSFFL's rule is triggered when the PLAYER
   * actually participates. MFL live scoring gives us player-level evidence.
   * A native MFL possible-IR warning is handled separately as an additional
   * authoritative trigger for IR.
   */
  return (Number.isFinite(score)&&score!==0)||Boolean(updated);
}
function popupNativeIrWarningForOwner(){
  var text=nativeNotificationText();
  return /\b(injured reserve|injury reserve|\bIR\b)\b/i.test(text)&&
         /\b(possible|illegal|invalid|ineligible|violation|must|remove|activate|error)\b/i.test(text);
}
function popupNativeRosterViolation(){
  var text=nativeNotificationText();
  return /\b(roster|players?|position)\b/i.test(text)&&
         /\b(illegal|invalid|violation|too many|too few|over limit|under limit|minimum|maximum|must|error)\b/i.test(text);
}
function popupCountPendingTrades(data,franchiseId){
  var found=[];
  function walk(value){
    if(!value){return;}
    if(Array.isArray(value)){value.forEach(walk);return;}
    if(typeof value!=="object"){return;}
    var looksTrade=("trade_id" in value)||("tradeId" in value)||
      ("offeringteam" in value)||("offeringTeam" in value)||
      ("willGiveUp" in value)||("willReceive" in value);
    if(looksTrade){
      var offering=normalizeFranchiseId(value.offeringteam||value.offeringTeam||value.franchise||"");
      var receiving=normalizeFranchiseId(value.receivingteam||value.receivingTeam||value.to||"");
      /*
       * pendingTrades is login-sensitive. Count records relevant to this
       * franchise; if MFL omits the receiving-team field, records returned
       * to the logged-in owner are still treated as relevant.
       */
      if(!receiving||receiving===franchiseId||offering===franchiseId){found.push(value);}
      return;
    }
    Object.keys(value).forEach(function(key){walk(value[key]);});
  }
  walk(data);
  return found.length;
}
function popupLoadOwnerData(){
  var franchiseId=popupCurrentFranchiseId();
  if(!franchiseId){
    ownerDataSnapshot.ready=true;
    return Promise.resolve(ownerDataSnapshot);
  }
  var week=3;
  try{
    var weekStart=new Date(2026,8,8,0,0,0,0);
    week=Math.max(1,Math.min(17,Math.floor((Date.now()-weekStart.getTime())/604800000)+1));
  }catch(error){}
  return Promise.allSettled([
    popupFetchJSON("rosters",{FRANCHISE:franchiseId}),
    popupFetchJSON("players",{}),
    popupFetchJSON("liveScoring",{W:week,DETAILS:1}),
    popupFetchJSON("pendingTrades",{})
  ]).then(function(results){
    var rosterData=results[0].status==="fulfilled"?results[0].value:null;
    var playersData=results[1].status==="fulfilled"?results[1].value:null;
    var liveData=results[2].status==="fulfilled"?results[2].value:null;
    var tradesData=results[3].status==="fulfilled"?results[3].value:null;
    var roster=popupFindCurrentRoster(rosterData,franchiseId);
    var players=popupPlayerMap(playersData);
    var live=popupLivePlayerMap(liveData,franchiseId);
    var nativeIr=popupNativeIrWarningForOwner();

    ownerDataSnapshot.irTaxi=[];
    popupAsArray(roster&&roster.player).forEach(function(rosterPlayer){
      var location=popupNormalizeRosterStatus(
        rosterPlayer.status||rosterPlayer.rosterStatus||rosterPlayer.roster_status
      );
      if(!location){return;}
      var id=String(rosterPlayer.id||"");
      var player=players[id]||{};
      var livePlayer=live[id]||null;
      var played=popupPlayerHasPlayed(livePlayer);
      var actionRequired=played||(location==="IR"&&nativeIr);
      ownerDataSnapshot.irTaxi.push({
        id:id,
        name:cleanText(player.name||player.fullName||player.displayName)||("Player "+id),
        nflTeam:cleanText(player.team||player.nfl_team||player.nflTeam).toUpperCase()||"FA",
        position:cleanText(player.position||player.pos)||"",
        status:popupPlayerStatus(player),
        location:location,
        played:played,
        actionRequired:actionRequired
      });
    });

    ownerDataSnapshot.pendingTrades=tradesData?popupCountPendingTrades(tradesData,franchiseId):0;
    ownerDataSnapshot.rosterViolation=popupNativeRosterViolation();
    ownerDataSnapshot.ready=true;
    return ownerDataSnapshot;
  }).catch(function(){
    ownerDataSnapshot.ready=true;
    return ownerDataSnapshot;
  });
}
function popupOwnerRosterLines(){
  var lines=[];
  ownerDataSnapshot.irTaxi.forEach(function(player){
    var label=player.location==="IR"?"IR":"TAXI";
    var descriptor=player.name+" — "+player.nflTeam+
      (player.position?" "+player.position:"")+
      " — Current status: "+player.status;
    if(player.actionRequired){
      lines.push("⚠ "+label+" ACTION REQUIRED: "+descriptor);
      lines.push("ACTION REQUIRED — "+player.name+" has played in a game; they must be activated or dropped before the waiver wire runs Wednesday at 12:00 PM. Deadline: 11:59 AM Wednesday.");
    }else{
      lines.push("• "+label+" REVIEW: "+descriptor);
    }
  });
  return lines;
}
function loadAnnouncementItems(){
  var article=extractArticleAnnouncement();
  var articleUrl=(article&&article.buttonUrl)?article.buttonUrl:MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=73";
  var ownerAlerts=extractOwnerManagerAlerts();
  var ownerStatusLines=[];
  var ownerStatusMeta="";
  var ownerStatusButtonText="";
  var ownerStatusButtonUrl="";

  var lineupBad=ownerAlerts.some(function(item){return item.title==="Starting Lineup Incomplete";});
  var nativeTradeAlert=ownerAlerts.some(function(item){return item.title==="Trade Offer Pending";});
  var rosterBad=ownerDataSnapshot.rosterViolation||ownerAlerts.some(function(item){
    return item.title==="Roster Violation"||item.title==="IR Violation"||item.title==="Taxi Squad Violation";
  });
  var irTaxiAction=ownerDataSnapshot.irTaxi.some(function(item){return item.actionRequired;});
  var tradeCount=Math.max(ownerDataSnapshot.pendingTrades,nativeTradeAlert?1:0);

  if(lineupBad){
    ownerStatusLines.push("⚠ LINEUP ACTION REQUIRED — Your starting lineup is invalid or incomplete.");
  }
  if(rosterBad){
    ownerStatusLines.push("⚠ ROSTER REVIEW — MFL is reporting a possible roster/IR/Taxi rule issue. Review your roster.");
  }

  popupOwnerRosterLines().forEach(function(line){ownerStatusLines.push(line);});

  if(tradeCount>0){
    ownerStatusLines.push("⚠ PENDING TRADE"+(tradeCount===1?"":"S")+": "+tradeCount+" trade request"+(tradeCount===1?" is":"s are")+" waiting for review.");
  }

  var needsAction=lineupBad||rosterBad||irTaxiAction||tradeCount>0;

  if(!ownerStatusLines.length){
    ownerStatusLines.push("No lineup errors, roster violations, IR/Taxi players requiring review, or pending trade requests were detected for your team.");
  }

  if(needsAction){
    var actionCount=(lineupBad?1:0)+(rosterBad?1:0)+
      ownerDataSnapshot.irTaxi.filter(function(item){return item.actionRequired;}).length+
      (tradeCount>0?1:0);
    ownerStatusMeta=actionCount===1?"1 OWNER ACTION ITEM":actionCount+" OWNER ACTION ITEMS";
    if(lineupBad){
      ownerStatusButtonText="Fix Lineup";
      ownerStatusButtonUrl=MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=02";
    }else if(tradeCount>0){
      ownerStatusButtonText="Review Trades";
      ownerStatusButtonUrl=MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=05";
    }else{
      ownerStatusButtonText="Review Roster";
      ownerStatusButtonUrl=MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=07";
    }
  }else{
    ownerStatusMeta=ownerDataSnapshot.irTaxi.length
      ? "IR / TAXI REVIEW COMPLETE • NO ACTION REQUIRED"
      : "YOUR TEAM IS GOOD TO GO";
  }

  return[
    {
      eyebrow:needsAction?"MY TEAM • ACTION REQUIRED":"MY TEAM • STATUS",
      title:needsAction?"Owner Alerts":"Your Team Is Good To Go",
      body:ownerStatusLines.join("\n\n"),
      meta:ownerStatusMeta,
      imageUrl:"",
      imageAlt:"",
      buttonText:ownerStatusButtonText,
      buttonUrl:ownerStatusButtonUrl
    },
    {
      eyebrow:"WEEK 2 RECAP",
      title:"One Week Was a Fluke. Two Weeks Is a Problem.",
      body:"The Lamad Ledger is back for Week 2. Hawky Bears dropped 185.35, Tiny but Mighty somehow managed 49, the Mad Hatters lost by a quarter of a point, and the defending champs got punched in the mouth. There were blowouts, bench disasters, bad beats, and enough terrible decisions to fill another edition of the LSFFL weekly recap.",
      meta:"THE LAMAD LEDGER • LSFFL WEEK 2 RECAP",
      imageUrl:"https://github.com/edmoak/LSFFL-Webpage/blob/main/images/wordmarks/Week%202%20Popup.png?raw=true",
      imageAlt:"LSFFL Week 2 Lamad Ledger recap",
      buttonText:"Read the Week 2 Article",
      buttonUrl:articleUrl
    },
    {
      eyebrow:"WEEK 3",
      title:"Get Your Week 3 Lineup In",
      body:"Week 3 is here. Get your starting lineup submitted and take one last look at injuries, questionable players, and late-week news before kickoff. Check the waiver wire while you're at it, because after two weeks we are starting to find out which players are real and which ones fooled us in Week 1.",
      meta:"SET YOUR LINEUP • CHECK INJURIES • WEEK 3",
      imageUrl:"",
      imageAlt:"",
      buttonText:"Submit Week 3 Lineup",
      buttonUrl:MFL_ORIGIN+"/"+YEAR+"/options?L="+LEAGUE_ID+"&O=02"
    }
  ];
}function injectAnnouncementStyles(){if(document.getElementById("lsffl-popup47-announcement-styles")){return;}var style=document.createElement("style");style.id="lsffl-popup47-announcement-styles";style.textContent=["#lsffl-popup47-announcement[hidden]{"+"display:none!important;"+"}","#lsffl-popup47-announcement{"+"position:fixed;"+"inset:0;"+"z-index:2147483100;"+"display:flex;"+"align-items:center;"+"justify-content:center;"+"padding:18px;"+"background:rgba(0,7,18,.88);"+"backdrop-filter:blur(5px);"+"-webkit-backdrop-filter:blur(5px);"+"}","#lsffl-popup47-announcement-card{"+"width:min(760px,96vw);"+"max-height:94vh;"+"overflow:auto;"+"border:2px solid #c9a227;"+"border-radius:14px;"+"background:linear-gradient(180deg,#0c2846 0%,#061426 52%,#02091a 100%);"+"color:#fff;"+"box-shadow:0 24px 90px rgba(0,0,0,.78);"+"}","#lsffl-popup47-announcement-head{"+"display:flex;"+"justify-content:space-between;"+"gap:16px;"+"padding:22px 22px 8px;"+"border-top:6px solid #c9a227;"+"}","#lsffl-popup47-announcement-eyebrow{"+"margin-bottom:5px;"+"color:#e1c45a;"+"font-family:'Barlow Condensed',Arial,sans-serif;"+"font-size:13px;"+"font-weight:900;"+"letter-spacing:1.7px;"+"text-transform:uppercase;"+"}","#lsffl-popup47-announcement-title{"+"margin:0;"+"color:#fff;"+"font-family:'Oswald','Barlow Condensed',Arial,sans-serif;"+"font-size:clamp(25px,4vw,36px);"+"line-height:1.03;"+"font-weight:900;"+"text-transform:uppercase;"+"}","#lsffl-popup47-announcement-close{"+"-webkit-appearance:none!important;"+"appearance:none!important;"+"width:22px!important;"+"min-width:22px!important;"+"max-width:22px!important;"+"height:22px!important;"+"min-height:22px!important;"+"max-height:22px!important;"+"margin:0!important;"+"padding:0!important;"+"display:grid!important;"+"place-items:center!important;"+"border:0!important;"+"border-radius:3px!important;"+"outline:0!important;"+"background:#7c6b2a!important;"+"background-image:none!important;"+"color:#9ca3ac!important;"+"box-shadow:none!important;"+"cursor:pointer!important;"+"overflow:hidden!important;"+"}","#lsffl-popup47-announcement-close svg{"+"display:block!important;"+"width:11px!important;"+"height:11px!important;"+"fill:none!important;"+"stroke:currentColor!important;"+"stroke-width:3.2!important;"+"stroke-linecap:square!important;"+"pointer-events:none!important;"+"}","#lsffl-popup47-announcement-close:hover,"+"#lsffl-popup47-announcement-close:focus{"+"background:#8c792f!important;"+"color:#b5bbc2!important;"+"outline:none!important;"+"}","#lsffl-popup47-announcement-body{"+"padding:12px 22px 8px;"+"color:#eef4fb;"+"font-family:Arial,sans-serif;"+"font-size:17px;"+"line-height:1.58;"+"}","#lsffl-popup47-announcement-text{"+"white-space:pre-line;"+"}","#lsffl-popup47-announcement-image{"+"display:none;"+"width:auto;"+"max-width:min(340px,100%);"+"height:auto;"+"max-height:225px;"+"margin:2px auto 14px;"+"object-fit:contain;"+"border:1px solid rgba(201,162,39,.38);"+"border-radius:10px;"+"box-shadow:0 8px 24px rgba(0,0,0,.28);"+"}","#lsffl-popup47-announcement-meta{"+"margin-top:12px;"+"color:#aebdcd;"+"font-size:13px;"+"font-weight:700;"+"}","#lsffl-popup47-announcement-actions{"+"display:flex;"+"padding:14px 22px 12px;"+"}","#lsffl-popup47-announcement-open{"+"display:none;"+"align-items:center;"+"justify-content:center;"+"min-height:42px;"+"padding:9px 18px;"+"border:1px solid #e1c45a;"+"border-radius:8px;"+"background:#c9a227;"+"color:#061426!important;"+"text-decoration:none!important;"+"font-family:'Barlow Condensed',Arial,sans-serif;"+"font-size:16px;"+"font-weight:900;"+"text-transform:uppercase;"+"}","#lsffl-popup47-announcement-nav{"+"display:flex;"+"align-items:center;"+"justify-content:space-between;"+"gap:12px;"+"padding:12px 22px;"+"border-top:1px solid rgba(201,162,39,.3);"+"background:rgba(0,0,0,.18);"+"}",".lsffl-popup47-announcement-navbtn{"+"min-width:86px!important;"+"min-height:36px!important;"+"padding:7px 12px!important;"+"border:1px solid #c9a227!important;"+"border-radius:7px!important;"+"background:#071a2f!important;"+"color:#fff!important;"+"font-family:'Barlow Condensed',Arial,sans-serif!important;"+"font-size:14px!important;"+"font-weight:900!important;"+"text-transform:uppercase!important;"+"cursor:pointer!important;"+"}",".lsffl-popup47-announcement-navbtn:disabled{"+"opacity:.35;"+"cursor:default!important;"+"}","#lsffl-popup47-announcement-counter{"+"color:#e1c45a;"+"font-family:'Barlow Condensed',Arial,sans-serif;"+"font-size:14px;"+"font-weight:900;"+"}","#lsffl-popup47-announcement-footer{"+"display:flex;"+"align-items:center;"+"justify-content:space-between;"+"gap:12px;"+"padding:11px 22px 14px;"+"color:#aebdcd;"+"font-family:Arial,sans-serif;"+"font-size:12px;"+"}","#lsffl-popup47-announcement-footer label{"+"display:flex;"+"align-items:center;"+"gap:7px;"+"}","#lsffl-popup47-announcement-footer input{"+"width:16px;"+"height:16px;"+"accent-color:#c9a227;"+"}"].join("");document.head.appendChild(style);}function createAnnouncementModal(){if(announcementModal){return;}injectAnnouncementStyles();announcementModal=document.createElement("div");announcementModal.id="lsffl-popup47-announcement";announcementModal.hidden=true;announcementModal.innerHTML='<div id="lsffl-popup47-announcement-card">'+'<div id="lsffl-popup47-announcement-head">'+'<div>'+'<div id="lsffl-popup47-announcement-eyebrow">'+'LSFFL'+'</div>'+'<h2 id="lsffl-popup47-announcement-title">'+'League Update'+'</h2>'+'</div>'+'<button '+'id="lsffl-popup47-announcement-close" '+'type="button" '+'aria-label="Close announcement">'+'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+'<path d="M6 6L18 18M18 6L6 18"></path>'+'</svg>'+'</button>'+'</div>'+'<div id="lsffl-popup47-announcement-body">'+'<img '+'id="lsffl-popup47-announcement-image" '+'src="" '+'alt="">'+'<div id="lsffl-popup47-announcement-text"></div>'+'<div id="lsffl-popup47-announcement-meta"></div>'+'</div>'+'<div id="lsffl-popup47-announcement-actions">'+'<a '+'id="lsffl-popup47-announcement-open" '+'href="#">'+'Read More'+'</a>'+'</div>'+'<div id="lsffl-popup47-announcement-nav">'+'<button '+'class="lsffl-popup47-announcement-navbtn" '+'id="lsffl-popup47-announcement-prev" '+'type="button">'+'Previous'+'</button>'+'<span id="lsffl-popup47-announcement-counter">'+'1 / 1'+'</span>'+'<button '+'class="lsffl-popup47-announcement-navbtn" '+'id="lsffl-popup47-announcement-next" '+'type="button">'+'Next'+'</button>'+'</div>'+'<div id="lsffl-popup47-announcement-footer">'+'<label>'+'<input '+'id="lsffl-popup47-announcement-dontshow" '+'type="checkbox">'+' Don\'t show announcements again for 24 hours'+'</label>'+'<span>'+'LSFFL • 2026 SEASON'+'</span>'+'</div>'+'</div>';document.body.appendChild(announcementModal);document.getElementById("lsffl-popup47-announcement-close").addEventListener("click",closeAnnouncement);document.getElementById("lsffl-popup47-announcement-prev").addEventListener("click",function(){showAnnouncement(announcementIndex-1);});document.getElementById("lsffl-popup47-announcement-next").addEventListener("click",function(){showAnnouncement(announcementIndex+1);});document.getElementById("lsffl-popup47-announcement-open").addEventListener("click",function(event){var item=announcementItems[announcementIndex];if(!item||!item.buttonUrl){return;}var match=classifyMflUrl(item.buttonUrl);if(!match){closeAnnouncement();return;}event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();closeAnnouncement();openModal(match.url,match.type,match.title);});announcementModal.addEventListener("click",function(event){if(event.target===announcementModal){closeAnnouncement();}});}function showAnnouncement(index){if(!announcementItems.length){return;}announcementIndex=Math.max(0,Math.min(index,announcementItems.length-1));var item=announcementItems[announcementIndex];document.getElementById("lsffl-popup47-announcement-eyebrow").textContent=item.eyebrow||"LSFFL";document.getElementById("lsffl-popup47-announcement-title").textContent=item.title||"League Update";var announcementImage=document.getElementById("lsffl-popup47-announcement-image");if(announcementImage&&item.imageUrl){announcementImage.src=item.imageUrl;announcementImage.alt=item.imageAlt||"";announcementImage.style.display="block";}else if(announcementImage){announcementImage.removeAttribute("src");announcementImage.alt="";announcementImage.style.display="none";}document.getElementById("lsffl-popup47-announcement-text").textContent=item.body||"";document.getElementById("lsffl-popup47-announcement-meta").textContent=item.meta||"";var open=document.getElementById("lsffl-popup47-announcement-open");if(item.buttonUrl){open.href=item.buttonUrl;open.textContent=item.buttonText||"Read More";open.style.display="inline-flex";}else{open.removeAttribute("href");open.style.display="none";}document.getElementById("lsffl-popup47-announcement-counter").textContent=(announcementIndex+1)+" / "+announcementItems.length;document.getElementById("lsffl-popup47-announcement-prev").disabled=announcementIndex===0;document.getElementById("lsffl-popup47-announcement-next").disabled=announcementIndex===announcementItems.length-1;}function openAnnouncement(){createAnnouncementModal();announcementItems=loadAnnouncementItems();if(!announcementItems.length){return false;}document.getElementById("lsffl-popup47-announcement-dontshow").checked=false;announcementModal.hidden=false;showAnnouncement(0);try{sessionStorage.setItem(ANNOUNCEMENT_SESSION_KEY,"1");}catch(error){}return true;}function closeAnnouncement(){if(!announcementModal||announcementModal.hidden){return;}var dontShow=document.getElementById("lsffl-popup47-announcement-dontshow");if(dontShow&&dontShow.checked){try{localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY,String(Date.now()+24*60*60*1000));}catch(error){}}announcementModal.hidden=true;}function shouldAutoOpenAnnouncement(){try{var dismissedUntil=Number(localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY)||0);if(dismissedUntil&&Date.now()<dismissedUntil){return false;}}catch(error){}try{if(sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY)==="1"){return false;}}catch(error){}return true;}function bootAnnouncement(){if(!isHomepage()){return;}if(!shouldAutoOpenAnnouncement()){return;}ensurePopupLineupChecker();var started=Date.now();var ownerPromise=popupLoadOwnerData();var ownerFinished=false;ownerPromise.then(function(){ownerFinished=true;});(function waitForSources(){var managerAlertReady=Boolean(nativeNotificationText());var lineupReady=popupLineupCheckerReady();if((lineupReady&&ownerFinished)||Date.now()-started>12000){window.setTimeout(openAnnouncement,350);return;}window.setTimeout(waitForSources,200);})();}window.lsfflPopup47={openAnnouncement:openAnnouncement,closeAnnouncement:closeAnnouncement,openFranchise:openFranchise,openContent:window.lsfflOpenContentPopup};window.lsfflPopup3=window.lsfflPopup47;if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",bootAnnouncement,{once:true});}else{bootAnnouncement();}})()
