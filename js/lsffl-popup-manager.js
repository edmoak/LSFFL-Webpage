<script>

// TEMPLATE INCREASE-DECREASE FONT SIZE - MENU>HELP>CUSTOMIZE PAGE SIZE
increaseFont = true;
if (localStorage.hasOwnProperty("fontSize_" + year + "_" + league_id)) {
  var SetStyle = localStorage.getItem("fontSize_" + year + "_" + league_id);
  if (SetStyle !== "undefined") {
    document.querySelector('html').setAttribute('style', SetStyle);
  }
}

</script>

<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
<script>jQuery(document).prop('title', 'LSFFL | Lamad Squad Fantasy Football League');</script>
<link rel="shortcut icon" href="https://www.mflscripts.com/ImageDirectory/script-images/favicon.ico" type="image/x-icon" />

<script>document.body.classList.add("lsffl-refresh");</script>



<style id="lsffl-refresh-theme">
:root{
  --lsffl-navy:#0b1f3a;
  --lsffl-navy-dark:#061426;
  --lsffl-navy-soft:#17345d;
  --lsffl-gold:#c9a227;
  --lsffl-gold-light:#e1c45a;
  --lsffl-white:#ffffff;
  --lsffl-surface:#f4f6f9;
  --lsffl-border:#d9e0e9;
  --lsffl-text:#12233f;
  --accent:#c9a227;
  --accent-color:#c9a227;
}
html,
body.lsffl-refresh{
  background-color:#061426!important;
  background-image:url("https://github.com/edmoak/LSFFL-Webpage/blob/main/images/backgrounds/lsfflbackground.png?raw=true")!important;
  background-repeat:no-repeat!important;
  background-position:center top!important;
  background-size:cover!important;
  background-attachment:fixed!important;
  color:var(--lsffl-text)!important;
  font-family:"Open Sans",Arial,sans-serif!important;
}
body.lsffl-refresh a{
  transition:color .18s ease,background-color .18s ease,border-color .18s ease,transform .18s ease,box-shadow .18s ease;
}
body.lsffl-refresh #container-wrap{max-width:1320px;margin:0 auto;}
/* Small action buttons aligned along the lower-right edge */
/* =========================================================
   LSFFL BANNER — SINGLE AUTHORITATIVE STYLE BLOCK
   ========================================================= */

body.lsffl-refresh .banner-container{
  position:relative;
  overflow:hidden;
  background-color:var(--lsffl-navy-dark)!important;
  background-image:url("https://github.com/edmoak/LSFFL-Webpage/blob/main/images/banners/lsfflbannerbackground.png?raw=true")!important;
  background-size:cover!important;
  background-position:center center!important;
  background-repeat:no-repeat!important;
  border-top:1px solid rgba(225,196,90,.65)!important;
  border-bottom:4px solid var(--lsffl-gold)!important;
  box-shadow:0 10px 28px rgba(4,16,35,.26);
}

body.lsffl-refresh .banner-container::before{
  content:none!important;
  display:none!important;
}

body.lsffl-refresh .banner-container-wrap{
  position:relative;
  z-index:1;
  width:100%!important;
  max-width:1320px!important;
  height:215px!important;
  min-height:215px!important;
  margin:0 auto!important;
  padding:0!important;
  overflow:hidden!important;
  box-sizing:border-box;
}

body.lsffl-refresh .banner-leftside{
  position:absolute!important;
  left:12px!important;
  top:0!important;
  bottom:0!important;
  display:flex!important;
  align-items:center!important;
  overflow:visible!important;
  z-index:2;
}

body.lsffl-refresh .banner-icon{
  position:relative!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:300px!important;
  min-width:300px!important;
  max-width:300px!important;
  height:215px!important;
  padding:0!important;
  flex:0 0 300px!important;
  overflow:visible!important;
}

body.lsffl-refresh .banner-icon > a{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:300px!important;
  height:215px!important;
  overflow:visible!important;
}

body.lsffl-refresh .bannericon{
  display:block!important;
  width:auto!important;
  height:300px!important;
  min-width:0!important;
  min-height:0!important;
  max-width:300px!important;
  max-height:300px!important;
  margin:0 auto!important;
  object-fit:contain!important;
  object-position:center center!important;
  image-rendering:auto!important;
  filter:drop-shadow(0 7px 13px rgba(0,0,0,.68))!important;
}

body.lsffl-refresh .bannertext{
  position:relative!important;
  z-index:2!important;
  width:535px!important;
  min-width:535px!important;
  margin-left:-40px!important;
  margin-top:-2px!important;
}

body.lsffl-refresh svg.league_name{
  display:block!important;
  width:100%!important;
  max-width:535px!important;
  height:152px!important;
  overflow:visible!important;
  filter:drop-shadow(0 4px 5px rgba(0,0,0,.82));
}

body.lsffl-refresh .banner-rightside{
  position:absolute!important;
  right:28px!important;
  bottom:10px!important;
  display:flex!important;
  align-items:flex-end!important;
  justify-content:flex-end!important;
  z-index:3;
}

body.lsffl-refresh .bannerlinkicons,
body.lsffl-refresh .icon-bar{
  display:flex!important;
  align-items:flex-end!important;
  justify-content:flex-end!important;
  width:auto!important;
  max-width:none!important;
  overflow:visible!important;
}

body.lsffl-refresh .icon-bar{
  gap:5px!important;
  flex-wrap:nowrap!important;
}

body.lsffl-refresh .icon-bar .icon-hide{
  display:none!important;
}

body.lsffl-refresh a.svg-iconlink{
  width:54px!important;
  min-width:54px!important;
  flex:0 0 54px!important;
  height:56px!important;
  min-height:56px!important;
  padding:5px 4px 4px!important;
  box-sizing:border-box!important;
  border:1px solid rgba(225,196,90,.75)!important;
  border-radius:7px!important;
  background:linear-gradient(180deg,rgba(7,27,53,.88),rgba(2,13,28,.92))!important;
  color:#fff!important;
  text-decoration:none!important;
  box-shadow:0 4px 10px rgba(0,0,0,.34),inset 0 0 0 1px rgba(255,255,255,.035);
}

body.lsffl-refresh a.svg-iconlink:hover{
  background:linear-gradient(180deg,var(--lsffl-gold-light),var(--lsffl-gold))!important;
  border-color:#f2d76e!important;
  color:var(--lsffl-navy-dark)!important;
  transform:translateY(-2px);
  box-shadow:0 7px 16px rgba(0,0,0,.3);
}

body.lsffl-refresh a.svg-iconlink .svg-icon{
  display:block!important;
  width:25px!important;
  height:27px!important;
  max-width:25px!important;
  max-height:27px!important;
  margin:0 auto 2px!important;
  fill:currentColor!important;
  color:inherit!important;
}

body.lsffl-refresh a.svg-iconlink .svg-text{
  color:inherit!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-size:8.5px!important;
  line-height:9px!important;
  font-weight:600!important;
  letter-spacing:.15px!important;
  text-align:center!important;
  white-space:normal!important;
  text-transform:uppercase;
}

@media only screen and (max-width:1120px){
  body.lsffl-refresh .banner-leftside{left:14px!important;}

  body.lsffl-refresh .banner-icon,
  body.lsffl-refresh .banner-icon > a{
    width:165px!important;
    min-width:165px!important;
    max-width:165px!important;
    height:165px!important;
    flex-basis:165px!important;
  }

  body.lsffl-refresh .bannericon{
    width:auto!important;
    height:165px!important;
    min-width:0!important;
    min-height:0!important;
    max-width:165px!important;
    max-height:165px!important;
  }

  body.lsffl-refresh .bannertext{
    width:430px!important;
    min-width:430px!important;
    margin-left:-10px!important;
  }

  body.lsffl-refresh svg.league_name{
    max-width:430px!important;
    height:130px!important;
  }

  body.lsffl-refresh .banner-rightside{right:14px!important;}
  body.lsffl-refresh .icon-bar{gap:5px!important;}
  body.lsffl-refresh a.svg-iconlink{
    width:52px!important;
    min-width:52px!important;
    flex-basis:52px!important;
  }
}

@media only screen and (max-width:900px){
  body.lsffl-refresh .banner-container-wrap{
    height:auto!important;
    min-height:170px!important;
    padding:10px 12px!important;
    display:flex!important;
    flex-direction:column!important;
    justify-content:center!important;
  }

  body.lsffl-refresh .banner-leftside{
    position:relative!important;
    left:auto!important;
    top:auto!important;
    bottom:auto!important;
    justify-content:center!important;
  }

  body.lsffl-refresh .banner-icon,
  body.lsffl-refresh .banner-icon > a{
    width:110px!important;
    min-width:110px!important;
    max-width:110px!important;
    height:110px!important;
    flex-basis:110px!important;
  }

  body.lsffl-refresh .bannericon{
    width:auto!important;
    height:110px!important;
    min-width:0!important;
    min-height:0!important;
    max-width:110px!important;
    max-height:110px!important;
  }

  body.lsffl-refresh .bannertext{
    width:min(430px,calc(100vw - 155px))!important;
    min-width:0!important;
    margin-left:0!important;
  }

  body.lsffl-refresh svg.league_name{
    width:100%!important;
    max-width:430px!important;
    height:auto!important;
  }

  body.lsffl-refresh .banner-rightside{
    position:relative!important;
    right:auto!important;
    bottom:auto!important;
    justify-content:center!important;
    margin-top:4px!important;
  }

  body.lsffl-refresh .icon-bar{
    justify-content:center!important;
    flex-wrap:wrap!important;
  }
}

@media only screen and (max-width:600px){
  body.lsffl-refresh .banner-container-wrap{min-height:150px!important;}

  body.lsffl-refresh .banner-icon,
  body.lsffl-refresh .banner-icon > a{
    width:78px!important;
    min-width:78px!important;
    max-width:78px!important;
    height:78px!important;
    flex-basis:78px!important;
  }

  body.lsffl-refresh .bannericon{
    width:auto!important;
    height:78px!important;
    min-width:0!important;
    min-height:0!important;
    max-width:78px!important;
    max-height:78px!important;
  }

  body.lsffl-refresh .bannertext{
    width:calc(100vw - 108px)!important;
  }

  body.lsffl-refresh a.svg-iconlink{
    width:47px!important;
    min-width:47px!important;
    height:50px!important;
    min-height:50px!important;
  }
}

body.lsffl-refresh .myfantasyleague_menu{
  background:var(--lsffl-navy-dark)!important;
  border-bottom:2px solid var(--lsffl-gold)!important;
  box-shadow:0 5px 14px rgba(4,16,35,.16);
}
body.lsffl-refresh .myfantasyleague_menu ul li a{
  color:#fff!important;
  font-family:"Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-weight:500!important;
  letter-spacing:.35px;
  text-transform:uppercase;
}
body.lsffl-refresh .myfantasyleague_menu ul li a:hover,
body.lsffl-refresh .myfantasyleague_menu ul li:hover>a,
body.lsffl-refresh .myfantasyleague_menu ul li.current>a{
  background:var(--lsffl-gold)!important;
  color:var(--lsffl-navy-dark)!important;
}
body.lsffl-refresh .myfantasyleague_menu ul ul{
  background:#fff!important;
  border:1px solid var(--lsffl-border)!important;
  box-shadow:0 12px 30px rgba(4,16,35,.18)!important;
}
body.lsffl-refresh .myfantasyleague_menu ul ul li a{
  color:var(--lsffl-text)!important;
  text-transform:none;
}
body.lsffl-refresh .myfantasyleague_menu ul ul li a:hover{
  background:#edf1f6!important;
  color:var(--lsffl-navy)!important;
}
/* =========================================================
   NATIVE MFL MODULES — LSFFL DARK NAVY & GOLD THEME
   ========================================================= */

/* Native MFL cards and reports */
body.lsffl-refresh .module:not(.homepagemodule):not(.lsffl-history-host),
body.lsffl-refresh .report:not(.homepagemodule):not(.lsffl-history-host),
body.lsffl-refresh .mobile-wrap:not(.homepagemodule):not(.lsffl-history-host),
body.lsffl-refresh .homepagemodule .module,
body.lsffl-refresh .homepagemodule .report,
body.lsffl-refresh .homepagemodule .mobile-wrap{
  background:#071a2f!important;
  background-image:none!important;
  color:#ffffff!important;
  border:1px solid #c9a227!important;
  border-radius:8px!important;
  box-shadow:0 6px 18px rgba(0,0,0,.34)!important;
  overflow:hidden!important;
}

/* Homepage tab wrappers remain transparent. */
body.lsffl-refresh .homepagemodule,
body.lsffl-refresh .homepagetabcontent,
body.lsffl-refresh .myfantasyleague_tabcontent{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  box-shadow:none!important;
}

/* History-page host wrappers remain transparent. */
body.lsffl-refresh .lsffl-history-host{
  background:transparent!important;
  background-image:none!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  box-shadow:none!important;
  overflow:visible!important;
  padding:0!important;
}

/* Module headings */
body.lsffl-refresh .module h3,
body.lsffl-refresh .module .modulehead,
body.lsffl-refresh .module .moduleheader,
body.lsffl-refresh .report caption,
body.lsffl-refresh .homepagemodule h3,
body.lsffl-refresh .homepagemodule .modulehead,
body.lsffl-refresh .homepagemodule .moduleheader,
body.lsffl-refresh .mobile-wrap h3{
  margin:0!important;
  padding:8px 10px!important;
  background:linear-gradient(180deg,#123755 0%,#071a2f 100%)!important;
  color:#ffffff!important;
  border:0!important;
  border-bottom:2px solid #c9a227!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-size:17px!important;
  line-height:20px!important;
  font-weight:800!important;
  letter-spacing:.55px!important;
  text-transform:uppercase!important;
  text-shadow:0 1px 2px rgba(0,0,0,.65)!important;
}

/* Remove light module body backgrounds */
body.lsffl-refresh .module .modulebody,
body.lsffl-refresh .module .modulecontent,
body.lsffl-refresh .homepagemodule .modulebody,
body.lsffl-refresh .homepagemodule .modulecontent,
body.lsffl-refresh .reportnavigation,
body.lsffl-refresh .reportnavigationheader{
  background:#071a2f!important;
  color:#ffffff!important;
  border-color:rgba(201,162,39,.32)!important;
}

/* Native reports and tables */
body.lsffl-refresh table.report,
body.lsffl-refresh .homepagemodule table{
  width:100%!important;
  border-collapse:separate!important;
  border-spacing:0!important;
  background:#071a2f!important;
  color:#ffffff!important;
}

body.lsffl-refresh table.report th,
body.lsffl-refresh .homepagemodule table th{
  padding:7px 8px!important;
  background:linear-gradient(180deg,#e1c45a 0%,#c9a227 100%)!important;
  color:#061426!important;
  border-color:#9d7912!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-weight:800!important;
  letter-spacing:.25px!important;
  text-transform:uppercase!important;
}

body.lsffl-refresh table.report td,
body.lsffl-refresh .homepagemodule table td{
  padding:6px 8px!important;
  background:#0b223c!important;
  color:#ffffff!important;
  border-color:rgba(201,162,39,.22)!important;
}

body.lsffl-refresh table.report tr:nth-child(even) td,
body.lsffl-refresh .homepagemodule table tr:nth-child(even) td{
  background:#102b49!important;
}

body.lsffl-refresh table.report tr:hover td,
body.lsffl-refresh .homepagemodule table tr:hover td{
  background:#173f68!important;
  color:#ffffff!important;
}

/* Native page text and links */
body.lsffl-refresh .module,
body.lsffl-refresh .report,
body.lsffl-refresh .mobile-wrap,
body.lsffl-refresh .homepagemodule{
  color:#ffffff!important;
}

body.lsffl-refresh .module a,
body.lsffl-refresh .report a,
body.lsffl-refresh .mobile-wrap a,
body.lsffl-refresh .homepagemodule a{
  color:#e1c45a!important;
  text-decoration:none!important;
}

body.lsffl-refresh .module a:hover,
body.lsffl-refresh .report a:hover,
body.lsffl-refresh .mobile-wrap a:hover,
body.lsffl-refresh .homepagemodule a:hover{
  color:#ffffff!important;
  text-decoration:underline!important;
}

/* Buttons */
body.lsffl-refresh input[type="submit"],
body.lsffl-refresh input[type="button"],
body.lsffl-refresh button,
body.lsffl-refresh .button,
body.lsffl-refresh a.button{
  background:linear-gradient(180deg,#123755 0%,#071a2f 100%)!important;
  color:#ffffff!important;
  border:1px solid #c9a227!important;
  border-radius:5px!important;
  padding:7px 13px!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-weight:800!important;
  text-transform:uppercase!important;
  box-shadow:0 3px 8px rgba(0,0,0,.28)!important;
}

body.lsffl-refresh input[type="submit"]:hover,
body.lsffl-refresh input[type="button"]:hover,
body.lsffl-refresh button:hover,
body.lsffl-refresh .button:hover,
body.lsffl-refresh a.button:hover{
  background:linear-gradient(180deg,#e1c45a 0%,#c9a227 100%)!important;
  border-color:#e1c45a!important;
  color:#061426!important;
}

/* Form controls */
body.lsffl-refresh input[type="text"],
body.lsffl-refresh input[type="password"],
body.lsffl-refresh input[type="email"],
body.lsffl-refresh input[type="number"],
body.lsffl-refresh select,
body.lsffl-refresh textarea{
  border:1px solid rgba(201,162,39,.65)!important;
  border-radius:5px!important;
  background:#061426!important;
  color:#ffffff!important;
}

body.lsffl-refresh select option{
  background:#061426!important;
  color:#ffffff!important;
}

body.lsffl-refresh input::placeholder,
body.lsffl-refresh textarea::placeholder{
  color:#aebbd0!important;
}

body.lsffl-refresh input:focus,
body.lsffl-refresh select:focus,
body.lsffl-refresh textarea:focus{
  border-color:#e1c45a!important;
  outline:none!important;
  box-shadow:0 0 0 3px rgba(201,162,39,.18)!important;
}

</style>

<!-- LSFFL: MFL may calculate owner notifications, but its native popup is never displayed. -->
<style id="lsffl-native-notification-shield">
#MFLPlayerPopupNotificationContainer,
#MFLPlayerPopupContainer{
  display:none!important;
  visibility:hidden!important;
  opacity:0!important;
  pointer-events:none!important;
}
</style>


<!-- LOAD CUSTOM BANNER -->
<div class="banner-container">

  <div class="banner-container-wrap">

    <div class="banner-leftside">

      <div class="banner-icon">
        <a href="//%HOST%/%YEAR%/home/%LEAGUEID%" title="Go to Homepage" style="position:relative;text-decoration:none">
        <div id="logo_svg_inserticon"></div>
          <img class="bannericon" align="middle" src="https://github.com/edmoak/LSFFL-Webpage/blob/main/images/logos/lsffl-logo-v1.png?raw=true" alt="LSFFL League Logo">
        </a>
      </div>          <!--- Close banner-icon --->

      <div class="bannertext">
        <svg class="league_name" viewBox="0 0 520 150" xmlns="http://www.w3.org/2000/svg" aria-label="Lamad Squad Fantasy Football League">
          <defs>
            <linearGradient id="lsfflGoldText" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f5d66b"/>
              <stop offset="48%" stop-color="#d7ad32"/>
              <stop offset="100%" stop-color="#a87912"/>
            </linearGradient>
          </defs>

          <text x="260" y="53"
                text-anchor="middle"
                fill="#ffffff"
                stroke="rgba(4,16,35,.65)"
                stroke-width="1.2"
                paint-order="stroke"
                style="font-family:'Oswald','Barlow Condensed','Arial Narrow',sans-serif;font-size:55px;font-style:italic;font-weight:700;letter-spacing:2.2px">
            LAMAD SQUAD
          </text>

          <text x="260" y="94"
                text-anchor="middle"
                fill="url(#lsfflGoldText)"
                stroke="rgba(4,16,35,.72)"
                stroke-width="1"
                paint-order="stroke"
                style="font-family:'Barlow Condensed','Oswald','Arial Narrow',sans-serif;font-size:34px;font-weight:800;letter-spacing:1.4px">
            FANTASY FOOTBALL LEAGUE
          </text>

          <line x1="10" y1="113" x2="178" y2="113" stroke="#c9a227" stroke-width="2"/>
          <text x="196" y="119"
                fill="#c9a227"
                style="font-family:Georgia,serif;font-size:22px;font-weight:700">★  ⚓  ★</text>
          <line x1="330" y1="113" x2="508" y2="113" stroke="#c9a227" stroke-width="2"/>

          <text x="259" y="142"
                text-anchor="middle"
                fill="#ffffff"
                style="font-family:'Barlow Condensed','Roboto Condensed','Arial Narrow',sans-serif;font-size:17px;font-weight:700;letter-spacing:3.2px">
            A TRADITION BORN ACROSS THE SEA
          </text>
        </svg>
      </div>          </div>            <!--- Close banner-leftside --->

    <div class="banner-rightside">

      <div class="bannerlinkicons">

        <div class="icon-bar">

          <!-- STANDINGS SVG -->
          <a class="svg-iconlink icon-hide" href="//%HOST%/%YEAR%/standings?L=%LEAGUEID%">
            <svg class="svg-icon icon-standings-v2" viewBox="0 0 85.3 158.94">
              <use href="#icon-standings-v2"></use>
            </svg>
            <div class="svg-text">Standings</div>
          </a>

          <!-- LINEUP SVG -->
          <a class="svg-iconlink" href="//%HOST%/%YEAR%/lineup?L=%LEAGUEID%">
            <svg class="svg-icon icon-lineup" viewBox="0 0 126.32 122.5">
              <use href="#icon-lineup-v2"></use>
            </svg>
            <div class="svg-text">Lineup</div>
          </a>

          <!-- ADD DROP SVG -->
          <a class="svg-iconlink" href="//%HOST%/%YEAR%/add_drop?L=%LEAGUEID%">
            <svg class="svg-icon icon-trade" viewBox="0 0 234.61 242.39">
              <use href="#icon-trade"></use>
            </svg>
            <div class="svg-text">Add/Drop</div>
          </a>

          <!-- TRADES SVG -->
          <a class="svg-iconlink" href="//%HOST%/%YEAR%/options?L=%LEAGUEID%&O=05">
            <svg class="svg-icon icon-trade" viewBox="0 0 170.37 100">
              <use href="#icon-trade-v2"></use>
            </svg>
            <div class="svg-text">Trades</div>
          </a>

          <!-- ROSTER SVG -->
          <a class="svg-iconlink" href="//%HOST%/%YEAR%/options?L=%LEAGUEID%&O=07">
            <svg class="svg-icon icon-roster" viewBox="0 0 74.38 67.51">
              <use href="#icon-helmet"></use>
            </svg>
            <div class="svg-text">Rosters</div>
          </a>

          <!-- SCOREBOARD SVG -->
          <a class="svg-iconlink" href="//%HOST%/%YEAR%/ajax_ls?L=%LEAGUEID%">
            <svg class="svg-icon icon-scoreboard" viewBox="0 0 254.49 236.32">
              <use href="#icon-scoreboard-v2" ></use>
            </svg>
            <div class="svg-text">Scoreboard</div>
          </a>

          <!-- CHAT SVG -->
          <a class="svg-iconlink icon-hide" href="//%HOST%/%YEAR%/home/%LEAGUEID%?MODULE=LEAGUE_CHAT" onclick="openChatWindow(this); return false;" target="_blank">
            <svg class="svg-icon icon-chat" viewBox="0 0 119.75 100">
              <use href="#icon-chat-v2"></use>
            </svg>
            <div class="svg-text">Chat</div>
          </a>

          <!-- RULES SVG -->
          <a class="svg-iconlink" href="//%HOST%/%YEAR%/home/%LEAGUEID%?MODULE=MESSAGE2">
            <svg class="svg-icon icon-rules" viewBox="0 0 135.12 194.78">
              <use href="#icon-rules"></use>
            </svg>
            <div class="svg-text">Rules</div>
          </a>

        </div>        <!--- Close icon-bar --->

      </div>          </div>            <!--- Close banner-rightside --->

  </div>              <!--- Close banner-container-wrap --->

</div>                <!--- Close banner-container --->



<!-- DEFINE GLOBAL VARIABLES  -->
<script>

// ADD COMMISSIONER ABILITIES LINK TO MENU
var add_abilities_link = true; // Set to true to add ability setup link to commish menu
var add_seedings_link = true; // Set to true to add seeding link to replace mfl seedings link
var SetHPMability = 18; // Set HPM# of commissioner ability script
var SetHPMseeding = 11; // Set HPM# of playoff seedings script

// MFL MOBILE MENU
var menuPositionY = 5;         // Set px distance for menu to be displayed from top of page
var menuPositionIsLeft = false;  // Set to true to show menu on left side of page; false for right
var showMenuIcons = true;      // Set to false to remove icons from left side of text on menu list

// MFL MODULE EXPAND AND COLLAPSE
var MFLEnableMedia = true;
var MFLRememberModuleStates = true;

// MFL ENHANCED CHAT
var chatAddonInsertImage = true;
var chatAddonInsertLink = true;
var chatAddonCustomEmoji = true;
var chatHideVideoLink = true;
var chatBottomUp = true;
var chatShowLapsedTime = true;
var chatShowMore = true;
var chatDefaultDisplayMessages = 8;
var chatUseFranchiseIcons = false;
var chatFranchiseIconHeight = 20;
var chatImageMaxHeight = 50;
var chatImageMaxWidth = 200;
var chatPopupWidth = 425;
var chatPopupHeight = 450;

// MFL PLAYER / SCORE POPUPS
// Keep player-news and score-detail popups available.
// Automatic MFL notification popups are disabled below so they do not
// compete with the LSFFL Pop-Up 2.0 manager.
var MFLPopupEnablePlayerNews = true;
var MFLPopupEnableArticle = false;
var MFLScoreDetailsPopup = true;
var MFLFranchisePopup = false;
var includeBiologo = true;
var includeBiologoAsset = false;

//SET COMMISH FRANCHISE ID
var commishTeam = "0001";

// ALL PLAY OR BEST BALL OPTIONS
var removeSchedule  = false;   // set to true to remove the tab and table content for Schedules - which may not apply to All Play or Best Ball Leagues
var removeWatchlist = false;   // set to true to remove the tab and table content for Watch List - which may not apply to All Play or Best Ball Leagues
var removeLineup    = false;   // set to true to remove the tab and table content for Lineup - which may not apply to All Play or Best Ball Leagues
var hideLinks       = false;   // set to true to remove links for "Propose Trade" , "Trade Bait" and "Transactions"  - which may not apply to All Play or Best Ball Leagues

//LIGHT SKIN SCORES POPUP CSS - DISREGARD THIS SETTING IF "ENABLE SCORES POPUP" SET TO FALSE
var detailsOverlay          = "rgba(0,0,0,.7)";            // Set bg color and opacity for overlay background
var detailsWrapBG           = "var(--mobile-wrap-bg,#fff)";// Set color of background for popup box
var detailsWrapBorder       = "#000";                      // Set color border around the popup box
var detailsWrapBorWidh      = "0px";                       // Set width of border around the popup box
var detailsWrapBoxShdw      = "0 0 25px #000";// Set popup box shadow
var detailsWrapPadding      = "10px";                      // Set popup box padding
var detailsWrapRadius       = "3px";                       // Set border radius for popup box

// =========================================================
// ORIGINAL MFL AUTO-NOTIFICATION POPUP — DISABLED
// LSFFL Pop-Up 2.0 is the only automatic notification popup.
// These settings do NOT disable normal player-information popups.
// =========================================================
/*
 * MFL still calculates its native owner notifications, but LSFFL hides
 * MFL's old popup and reads the results into Pop-Up 4.4.
 *
 * AutoNotification + Reminders supply roster/IR/taxi/lineup warnings.
 * Trade + TradePoll supply pending trade alerts.
 * Messages/CommishMessage remain off so unrelated MFL popups are not added.
 */
var MFLPopupEnableAutoNotification = true;
var MFLPopupEnableTrade = true;
var MFLPopupEnableTradePoll = true;
var MFLPopupEnableReminders = true;
var MFLPopupEnableMessages = false;
var MFLPopupEnableCommishMessage = false;
var MFLPopupCommishMessage = "";
var MFLPlayerPopupIncludeNFLLogo = true;
var MFLPlayerPopupLinkPopup = true; // Clicking a player link opens the player popup

//ENABLE MENU POPUP SEARCH
var ShowMFLsearch = true; // Set this to true to have a player button added to menu

// CUSTOM SUBMIT LINEUP VAR
var hideFantasySharks = false;	 //Set to true to hide links to Fantasy Sharks
var hideOptionalMsg   = true;   //Set to true to hide optional message input below lineup table
var hideLineupHint    = true;	 //Set to true to hide the lineup "Hint" message below lineup table
var lu_useDefaultAsPrimary = false; //Set to true to use the MFL default lineup submission page until owner decides to click to use custom
var showWeatherPop    = true;	        //Set to false to remove the popup for the weather link

// BOX SCORES SETTINGS
var mflBoxHomePageOnly = true;
var mflBoxShowNonStarter = true;
var mflBoxUseIcon = false;    // if true will use mfl icon unless user-defined below has been set
var mflBoxUseLogo = true;   // if true will use mfl logo unless user-defined below has been set
var mflBoxUseAbbrev = true; // if true will use mfl abbrev
var mflBoxHideFantasyMatchups = false;  // Set this to true if you want to hide Fantasy Matchups - note this var or the following var - one must be set to "false" or nothing will appear in the boxscores
var mflBoxHideNFLMatchups     = true;  // Set this to true if you want to hide NFL Matchups - note this var or the previous var - one must be set to "false" or nothing will appear in the boxscores
var mflBoxHidePaceScores      = true;  // Set this to true to remove the projected points - pace scores from the fantasy matchups boxscores

// CUSTOM TAB SCRIPT SHOW ALL PAGE
var load_tabs_versionTwo = true; // LEAVE THIS SET TO FALSE UNLESS YOU ARE USING OUR CUSTOM TEMPLATE
var showTabsAllPages = true;     // set to false to only show tabs on homepage
var changeMainTabName = "Home";  // rename to main tab
var changeAllTabName = true;     // rename the tab title on mobiles to current tab name
var MFL_customTabs_FakeTabs = new Array();

// HEADER JS FILE OPTIONS
var load_mobileMenu_script=true;      //Set to true to load https://www.mflscripts.com/mfl-apps/mobileMenu/script.js
var load_chat_enhanced=true;          //Set to true to load https://www.mflscripts.com/mfl-apps/chat/enhanced.js
var load_popup=true;                  //Set to true to load https://www.mflscripts.com/mfl-apps/popups/players/script.js
var load_mini_boxscore=true;          //Set to true to load https://www.mflscripts.com/mfl-apps/scoreboard/mini-boxscore/script.js
var load_marquee=false;               // Original MFL ticker is loaded elsewhere
var load_lineups_submit_script=true;  //Set to true to load https://www.mflscripts.com/mfl-apps/lineups/submit/script.js
var load_tabs_script=true;            //Set to true to load https://www.mflscripts.com/mfl-apps/tabs/script.js
var load_irReport_script=true;        //Set to true to load https://www.mflscripts.com/mfl-apps/injuredReserve/IRreport/script.js
var load_diceRoll_script=true;        //Set to true to load https://www.mflscripts.com/mfl-apps/diceRoll/script.js

</script>

<!-- MINI SCOREBOARD HTML -->
<div id="MFLBoxWrapper"></div>

<!-- HIDE IN OFFSEASON -->
<script>
// Below is example of the 2024 season - start date 1 day prior to preseason game 1 , end date 1 day after Superbowl
//var setCustomDates = false;
//var nflStartWk = "08/06/2024";  // define a date 1 day prior to when you want offseason script to start
//var nflEndWk   = "02/13/2025";  // define a date 1 day after you want offseason scripts to be removed

// Hide these scripts in offseason
var deactivate_all_offseason = false;     //set to true to deactivate ALL eligible scripts during the offseason

// optional var to hide individual elements during the offseason - example below - remove the double // to activate
//var hide_extra = ".offseason-hide,#tab7,#tab8,#playoffTable,#tab306,#tab307,#tab301"; // use id(#) or class(.) element name to hide any item during NFL offseason
</script>

<script src="https://www.mflscripts.com/mfl-apps/global/header.js"></script>
<script src="https://edmoak.github.io/LSFFL-Webpage/js/lsffl-popup-manager.js?v=42"></script>

<link rel="stylesheet" type="text/css" href="https://www.mflscripts.com/mfl-apps/lineups/submit/responsive.css">
<link rel="stylesheet" type="text/css" href="https://www.mflscripts.com/mfl-apps/global/css/300x500-icons.css">

<!-- LSFFL SCOREBOARD — SINGLE AUTHORITATIVE STYLE AND SCRIPT -->
<style id="lsffl-scoreboard-clean">
body.lsffl-refresh #MFLBoxWrapper{
  width:100%!important;
  max-width:none!important;
  min-height:122px!important;
  margin:0 auto 4px!important;
  padding:3px 0 5px!important;
  box-sizing:border-box!important;
  overflow:visible!important;
  border:0!important;
  border-top:2px solid #c9a227!important;
  border-bottom:2px solid #c9a227!important;
  border-radius:0!important;
  background:#061426!important;
  box-shadow:0 5px 13px rgba(3,14,30,.28)!important;
}

body.lsffl-refresh #MFLBoxWrapper,
body.lsffl-refresh #MFLBoxWrapper *{
  box-sizing:border-box!important;
}

/* Prevent the original light skin from flashing white while a new week loads. */
body.lsffl-refresh #MFLBoxWrapper > div,
body.lsffl-refresh #MFLBoxWrapper ul,
body.lsffl-refresh #MFLBoxWrapper li,
body.lsffl-refresh #MFLBoxWrapper table,
body.lsffl-refresh #MFLBoxWrapper tbody,
body.lsffl-refresh #MFLBoxWrapper tr,
body.lsffl-refresh #MFLBoxWrapper td{
  background-color:#061426!important;
  background-image:none!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-scoreboard-scroll{
  width:100%!important;
  min-height:112px!important;
  overflow-x:auto!important;
  overflow-y:hidden!important;
  scrollbar-width:none;
  background:#061426!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-scoreboard-scroll::-webkit-scrollbar{
  display:none;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-scoreboard-row{
  display:grid!important;
  grid-template-columns:repeat(8,minmax(145px,1fr))!important;
  align-items:stretch!important;
  width:100%!important;
  min-height:112px!important;
  margin:0!important;
  padding:0!important;
  background:#061426!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-score-card{
  min-width:0!important;
  min-height:112px!important;
  margin:0!important;
  padding:8px 10px 9px!important;
  display:flex!important;
  flex-direction:column!important;
  justify-content:center!important;
  overflow:hidden!important;
  border:0!important;
  border-right:1px solid rgba(201,162,39,.5)!important;
  border-radius:0!important;
  background:linear-gradient(180deg,#102f55 0%,#071a33 100%)!important;
  color:#fff!important;
  box-shadow:none!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-score-card:last-child{
  border-right:0!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-score-card *{
  background:transparent!important;
  color:#fff!important;
  border:0!important;
  box-shadow:none!important;
  opacity:1!important;
}

/* Prevent MFL's disabled/current-week classes from dimming the active week. */
body.lsffl-refresh #MFLBoxWrapper,
body.lsffl-refresh #MFLBoxWrapper *,
body.lsffl-refresh #MFLBoxWrapper *::before,
body.lsffl-refresh #MFLBoxWrapper *::after,
body.lsffl-refresh #MFLBoxWrapper .scoringLinkDisable,
body.lsffl-refresh #MFLBoxWrapper .scoringLinkDisable *,
body.lsffl-refresh #MFLBoxWrapper .current,
body.lsffl-refresh #MFLBoxWrapper .current *,
body.lsffl-refresh #MFLBoxWrapper .active,
body.lsffl-refresh #MFLBoxWrapper .active *,
body.lsffl-refresh #MFLBoxWrapper .selected,
body.lsffl-refresh #MFLBoxWrapper .selected *{
  opacity:1!important;
  filter:none!important;
  visibility:visible!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-score-card,
body.lsffl-refresh #MFLBoxWrapper .scoringLinkDisable .lsffl-score-card,
body.lsffl-refresh #MFLBoxWrapper .current .lsffl-score-card,
body.lsffl-refresh #MFLBoxWrapper .active .lsffl-score-card,
body.lsffl-refresh #MFLBoxWrapper .selected .lsffl-score-card{
  background:linear-gradient(180deg,#102f55 0%,#071a33 100%)!important;
  color:#fff!important;
}
body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-team{
  display:grid!important;
  padding:0!important;
  grid-template-columns:54px minmax(0,1fr) auto!important;
  align-items:center!important;
  column-gap:6px!important;
  width:100%!important;
  min-height:44px!important;
}

/* Team logos — use the largest clean artwork possible, with no decorative frame. */
body.lsffl-refresh #MFLBoxWrapper .lsffl-logo-link{
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:50px!important;
  height:44px!important;
  min-width:50px!important;
  min-height:44px!important;
  margin:0!important;
  padding:0!important;
  box-sizing:border-box!important;
  overflow:visible!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  box-shadow:none!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-logo-link img{
  display:block!important;
  width:48px!important;
  height:48px!important;
  min-width:48px!important;
  min-height:48px!important;
  max-width:48px!important;
  max-height:48px!important;
  margin:0!important;
  padding:0!important;
  object-fit:contain!important;
  object-position:center!important;
  background:transparent!important;
  image-rendering:auto!important;
  transform:scale(1.18)!important;
  transform-origin:center!important;
  filter:contrast(1.08) saturate(1.08) drop-shadow(0 1px 2px rgba(0,0,0,.62))!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-name{
  min-width:0!important;
  overflow:hidden!important;
  text-overflow:ellipsis!important;
  white-space:nowrap!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-size:14px!important;
  line-height:16px!important;
  font-weight:800!important;
  letter-spacing:.35px!important;
  text-transform:uppercase!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-team-link{
  min-width:0!important;
  color:#ffffff!important;
  text-decoration:none!important;
  cursor:pointer!important;
}
body.lsffl-refresh #MFLBoxWrapper .lsffl-team-link:hover .lsffl-clean-name{
  color:#e1c45a!important;
  text-decoration:underline!important;
}
body.lsffl-refresh #MFLBoxWrapper .lsffl-logo-link:hover img{
  transform:scale(1.22)!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-record{
  white-space:nowrap!important;
  text-align:right!important;
  margin-left:4px!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-size:12px!important;
  line-height:14px!important;
  font-weight:800!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-date{
  margin-top:5px!important;
  padding-top:5px!important;
  border-top:1px solid rgba(201,162,39,.22)!important;
  color:#eef2f7!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-size:11px!important;
  line-height:12px!important;
  font-weight:700!important;
  letter-spacing:.35px!important;
  text-align:center!important;
  white-space:nowrap!important;
}

/* Week label on the left. */
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-label,
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-label *{
  color:#e1c45a!important;
  fill:#e1c45a!important;
  stroke:#e1c45a!important;
  font-family:"Barlow Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif!important;
  font-weight:800!important;
  text-transform:uppercase!important;
  text-shadow:0 1px 2px rgba(0,0,0,.75)!important;
}

/* Previous/next week controls on the right. */
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-nav,
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-nav *,
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-nav::before,
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-nav::after{
  color:#e1c45a!important;
  fill:#e1c45a!important;
  stroke:#e1c45a!important;
  border-color:#e1c45a!important;
  opacity:1!important;
  text-shadow:0 1px 2px rgba(0,0,0,.75)!important;
}

body.lsffl-refresh #MFLBoxWrapper .lsffl-week-nav:hover,
body.lsffl-refresh #MFLBoxWrapper .lsffl-week-nav:hover *{
  color:#fff!important;
  fill:#fff!important;
  stroke:#fff!important;
}

@media only screen and (max-width:1100px){
  body.lsffl-refresh #MFLBoxWrapper .lsffl-scoreboard-row{
    grid-template-columns:repeat(8,145px)!important;
    width:max-content!important;
    min-width:100%!important;
  }
}

@media only screen and (max-width:600px){
  body.lsffl-refresh #MFLBoxWrapper .lsffl-scoreboard-row{
    grid-template-columns:repeat(8,145px)!important;
  }

  body.lsffl-refresh #MFLBoxWrapper .lsffl-score-card{
    min-height:98px!important;
    padding:7px 8px 7px!important;
  }

  body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-team{
    grid-template-columns:40px minmax(0,1fr) auto!important;
    min-height:36px!important;
    column-gap:5px!important;
  }

  body.lsffl-refresh #MFLBoxWrapper .lsffl-logo-link{
    width:40px!important;
    height:36px!important;
    min-width:40px!important;
    min-height:36px!important;
  }

  body.lsffl-refresh #MFLBoxWrapper .lsffl-logo-link img{
    width:38px!important;
    height:38px!important;
    min-width:38px!important;
    min-height:38px!important;
    max-width:38px!important;
    max-height:38px!important;
    transform:scale(1.12)!important;
  }

  body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-name{
    font-size:12px!important;
    line-height:14px!important;
  }

  body.lsffl-refresh #MFLBoxWrapper .lsffl-clean-record{
    font-size:10px!important;
    line-height:12px!important;
  }
}
</style>

<script>
(function(){
  "use strict";

  var observer = null;
  var rebuildTimer = null;
  var isBuilding = false;

  /*
   * LIVE FRANCHISE DATA FROM THE ACTIVE MFL LEAGUE.
   * Nothing below hard-codes team abbreviations.
   */
  var franchiseByName = Object.create(null);
  var leagueDataReady = false;

  function cleanText(value){
    return String(value || "").replace(/\s+/g," ").trim();
  }

  function normalizeName(value){
    return cleanText(value)
      .toLowerCase()
      .replace(/[’]/g,"'")
      .replace(/[^a-z0-9' ]+/g," ")
      .replace(/\s+/g," ")
      .trim();
  }

  function visibleChildren(el){
    return Array.from(el.children).filter(function(child){
      var style = window.getComputedStyle(child);
      return style.display !== "none" && style.visibility !== "hidden";
    });
  }

  function franchiseArrayFromLeagueJSON(data){
    if(!data){
      return [];
    }

    var value =
      data.league &&
      data.league.franchises &&
      data.league.franchises.franchise;

    if(!value){
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  function loadLiveLeagueData(){
    var url =
      "/2026/export?TYPE=league&L=23135&JSON=1";

    return fetch(url,{
      credentials:"same-origin",
      cache:"no-store"
    })
    .then(function(response){
      if(!response.ok){
        throw new Error("MFL league data request failed");
      }
      return response.json();
    })
    .then(function(data){
      franchiseArrayFromLeagueJSON(data).forEach(function(franchise){
        var name = cleanText(franchise.name);
        var abbrev = cleanText(
          franchise.abbrev ||
          franchise.abbreviation ||
          franchise.shortName ||
          ""
        );
        var id = cleanText(franchise.id);

        if(!name){
          return;
        }

        franchiseByName[normalizeName(name)] = {
          id:id,
          name:name,
          abbrev:abbrev || name,
          url:
            "/2026/options?L=23135&F=" +
            encodeURIComponent(id) +
            "&O=01"
        };
      });

      leagueDataReady = true;
      return true;
    })
    .catch(function(error){
      console.warn("LSFFL scoreboard: could not load live MFL franchise data.",error);
      leagueDataReady = true;
      return false;
    });
  }

  function findCardRow(root){
    var candidates = Array.from(root.querySelectorAll("div,ul,tbody,tr"));
    var best = null;
    var bestScore = 0;

    candidates.forEach(function(el){
      var kids = visibleChildren(el);
      if(kids.length < 4 || kids.length > 20) return;

      var imageCount = el.querySelectorAll("img").length;
      if(imageCount < kids.length) return;

      var score = kids.length * 10 + imageCount;
      if(score > bestScore){
        best = el;
        bestScore = score;
      }
    });

    return best;
  }

  function findNames(card,images){
    var lines = (card.innerText || card.textContent || "")
      .split(/\n+/)
      .map(cleanText)
      .filter(Boolean);

    var names = lines.filter(function(value){
      var normalized = normalizeName(value);

      return /^[A-Za-z0-9'’& .-]{2,40}$/.test(value) &&
             !/^(WK|WEEK|MON|TUE|WED|THU|FRI|SAT|SUN)/i.test(value) &&
             !/\(\s*\d+\s*-\s*\d+\s*-\s*\d+\s*\)/.test(value) &&
             !/\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\b/i.test(value) &&
             (
               franchiseByName[normalized] ||
               Object.keys(franchiseByName).some(function(key){
                 return normalized === key ||
                        normalized.indexOf(key) !== -1 ||
                        key.indexOf(normalized) !== -1;
               })
             );
    });

    images.forEach(function(img){
      var label = cleanText(img.alt || img.title || "");
      var normalized = normalizeName(label);

      if(
        label &&
        !names.includes(label) &&
        (
          franchiseByName[normalized] ||
          Object.keys(franchiseByName).some(function(key){
            return normalized === key ||
                   normalized.indexOf(key) !== -1 ||
                   key.indexOf(normalized) !== -1;
          })
        )
      ){
        names.push(label);
      }
    });

    return names.slice(0,2);
  }

  function resolveFranchise(name){
    var normalized = normalizeName(name);

    if(franchiseByName[normalized]){
      return franchiseByName[normalized];
    }

    var keys = Object.keys(franchiseByName);

    for(var index = 0; index < keys.length; index += 1){
      var key = keys[index];

      if(
        normalized === key ||
        normalized.indexOf(key) !== -1 ||
        key.indexOf(normalized) !== -1
      ){
        return franchiseByName[key];
      }
    }

    return null;
  }

  function findRecords(card){
    var matches = (card.innerText || card.textContent || "")
      .match(/\(\s*\d+\s*-\s*\d+\s*-\s*\d+\s*\)/g) || [];

    while(matches.length < 2){
      matches.push("(0-0-0)");
    }

    return matches.slice(0,2).map(cleanText);
  }

  function findDate(card){
    var match = (card.innerText || card.textContent || "")
      .match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}\b/i);

    return match ? cleanText(match[0]) : "";
  }

  function teamRow(img,name,record){
    var row = document.createElement("div");
    row.className = "lsffl-clean-team";

    var franchise = resolveFranchise(name);

    var logoLink = document.createElement(franchise ? "a" : "span");
    logoLink.className = "lsffl-logo-link" + (franchise ? " lsffl-team-link" : "");

    if(franchise){
      logoLink.href = franchise.url;
      logoLink.setAttribute("data-mfl-franchise",franchise.id);
    }

    /*
     * IMPORTANT:
     * MFLBox is configured with mflBoxUseIcon = false and mflBoxUseLogo = true,
     * so the image already present in the native mini-scoreboard is the team's
     * LOGO. Preserve that exact source instead of substituting franchise.icon,
     * which is the helmet image in this league.
     */
    if(img){
      var logoImage = img.cloneNode(true);
      logoImage.removeAttribute("style");
      logoImage.removeAttribute("width");
      logoImage.removeAttribute("height");
      logoImage.removeAttribute("srcset");
      logoImage.loading = "eager";
      logoImage.decoding = "async";
      logoLink.appendChild(logoImage);
    }else{
      logoLink.appendChild(document.createElement("span"));
    }

    row.appendChild(logoLink);

    var nameWrap = document.createElement(franchise ? "a" : "span");
    nameWrap.className = franchise ? "lsffl-team-link" : "";

    if(franchise){
      nameWrap.href = franchise.url;
      nameWrap.setAttribute("data-mfl-franchise",franchise.id);
    }

    var nameEl = document.createElement("span");
    nameEl.className = "lsffl-clean-name";

    /*
     * THIS is the important part:
     * abbreviation comes from the active league's MFL export.
     */
    nameEl.textContent =
      franchise
        ? franchise.abbrev
        : cleanText(name || "TEAM");

    nameWrap.appendChild(nameEl);
    row.appendChild(nameWrap);

    var recordEl = document.createElement("span");
    recordEl.className = "lsffl-clean-record";
    recordEl.textContent = record || "(0-0-0)";
    row.appendChild(recordEl);

    return row;
  }

  function rebuildCard(card){
    if(card.dataset.lsfflClean === "1"){
      return;
    }

    var images = Array.from(card.querySelectorAll("img")).slice(0,2);
    var names = findNames(card,images);
    var records = findRecords(card);
    var date = findDate(card);

    /*
     * If MFL's card hasn't exposed two recognizable franchise names yet,
     * do NOT destroy the native card. Wait and retry.
     */
    if(names.length < 2){
      return;
    }

    card.innerHTML = "";
    card.className = "lsffl-score-card";

    card.appendChild(
      teamRow(images[0],names[0],records[0])
    );

    card.appendChild(
      teamRow(images[1],names[1],records[1])
    );

    var dateEl = document.createElement("div");
    dateEl.className = "lsffl-clean-date";
    dateEl.textContent = date || "MATCHUP";
    card.appendChild(dateEl);

    card.dataset.lsfflClean = "1";
  }

  function styleWeekControls(root){
    Array.from(root.querySelectorAll("*")).forEach(function(el){
      var text = cleanText(el.textContent);
      var label = cleanText(
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.className ||
        ""
      );

      if(/^(WK|WEEK)\s*\d+$/i.test(text)){
        el.classList.add("lsffl-week-label");
      }

      if(
        /previous|next|prev|arrow|chevron/i.test(label) ||
        /^[‹›«»<>]$/.test(text)
      ){
        el.classList.add("lsffl-week-nav");
      }
    });
  }

  function buildScoreboard(){
    if(isBuilding || !leagueDataReady){
      return false;
    }

    var root = document.getElementById("MFLBoxWrapper");
    if(!root){
      return false;
    }

    var row = findCardRow(root);
    if(!row){
      styleWeekControls(root);
      return false;
    }

    var cards = visibleChildren(row);
    if(cards.length < 4){
      styleWeekControls(root);
      return false;
    }

    isBuilding = true;

    try{
      if(row.parentElement){
        row.parentElement.classList.add("lsffl-scoreboard-scroll");
      }

      row.classList.add("lsffl-scoreboard-row");

      cards.forEach(function(card){
        rebuildCard(card);
      });

      Array.from(root.querySelectorAll(".scoringLinkDisable")).forEach(function(el){
        el.classList.remove("scoringLinkDisable");
      });

      styleWeekControls(root);
    }finally{
      isBuilding = false;
    }

    return true;
  }

  function scheduleBuild(delay){
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(function(){
      buildScoreboard();
    },delay || 60);
  }

  function start(){
    var root = document.getElementById("MFLBoxWrapper");

    if(!root){
      window.setTimeout(start,250);
      return;
    }

    loadLiveLeagueData().then(function(){
      buildScoreboard();
    });

    observer = new MutationObserver(function(){
      if(!isBuilding){
        scheduleBuild(100);
      }
    });

    observer.observe(root,{
      childList:true,
      subtree:true
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",start);
  }else{
    start();
  }
})();
</script>
<!-- REVEAL MFL MENU AFTER HEADER SCRIPTS INITIALIZE -->
<script>jQuery('.myfantasyleague_menu ul,.MFLSkinSelection').css('visibility','visible');</script>
<!-- WRAP ALL CONTENT -->
<div id="container-wrap"><!--- ENTER ALL HPMS AFTER THIS AND CLOSE IN FOOTER -->

<!-- HOME TAB WRAPPER FIX — targets only the wrapper containing LSFFL homepage content -->
<style id="lsffl-home-wrapper-fix">
body#body_home.lsffl-refresh .mobile-wrap.lsffl-home-host{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border:0!important;
  border-radius:0!important;
  outline:0!important;
  box-shadow:none!important;
  padding:0!important;
  overflow:visible!important;
}
</style>

<script>
(function(){
  "use strict";

  function markHomeWrapper(){
    var home = document.querySelector(".lsffl-home-content");
    if(!home) return false;

    var wrapper = home.closest(".mobile-wrap");
    if(!wrapper) return false;

    wrapper.classList.add("lsffl-home-host");
    return true;
  }

  function startHomeWrapperFix(){
    var attempts = 0;
    var timer = window.setInterval(function(){
      attempts++;
      if(markHomeWrapper() || attempts >= 80){
        window.clearInterval(timer);
      }
    },100);

    var observer = new MutationObserver(function(){
      markHomeWrapper();
    });

    observer.observe(document.documentElement,{
      childList:true,
      subtree:true
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",startHomeWrapperFix);
  }else{
    startHomeWrapperFix();
  }
})();
</script>
