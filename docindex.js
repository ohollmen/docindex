/** @file
*
Minimal demo:
git clone https://github.com/ohollmen/docindex.git
cd docindex
git clone https://github.com/showdownjs/showdown.git


# Simulate node_modules for docindex.html Script and CSS URL:s
mkdir node_modules
ln -s `pwd` node_modules/docindex
# Showdown in showdown/dist/showdown.js
ln -s `pwd`/showdown node_modules/showdown
python3 -m http.server
*/

/*
* ## internal API Documentation
* 
* Generate API documentation with JSDoc (Hint: do not use Ubuntu's outdated JSDoc):
* 
*      jsdoc docindex.js -c ../crudrest/jsdoc.conf.json
* 
* ## TODO
* - Add server side component and search (content or title)
* - In-mem db (server OR client)
*/


/* jshint -W030 */

// Running JSDoc: 

// TODO: Use el = document.querySelector(selectors); more widely (?)

// Note for SPA
// 2nd param of makes paging links clickable EVEN if the whole innerHTML changed.
// It is evaluated at runtime when event takes place as an additional refinement to selector scope that
// main selector defines (it will "sub-select" elements inside main selector). See: http://api.jquery.com/on/
//$('#content').on('click', 'paged a', getpage); // getpage is paging page-fetch function
// ALSO: Note difference between  html() (innerHTML) and replaceWith() (element itself + any inner content)

/** Constructor for docIndex.
* See Main doc for config options.
* @constructor
*/
function docIndex(cfg) {
  cfg = cfg || {};
  var debug = cfg.debug || docIndex.docindex_conf.debug || 0;
  //console.log("DEBUG: "+debug);
  // Override defaults
  Object.keys(cfg).forEach(function (k) {
    debug && console.log("Config key: " + k);
    docIndex.docindex_conf[k] = cfg[k];
  });
  if (docIndex.docindex_conf.debug) { docIndex.dump(docIndex.docindex_conf, "CONFIG1"); }
  // Class init
  if (!docIndex.inited) {
    docIndex.converter = new showdown.Converter();
    docIndex.inited = 1;
  }
  if (debug) { this.debug = debug; }
  //self = docIndex.docindex_conf;
  var keys = Object.keys(docIndex.docindex_conf); // Class level keys
  // Copy defaults to "this"
  keys.forEach(function (key) {
    // if (key == 'ondocchange') { docIndex.ondocchange = docIndex.docindex_conf[key]; continue; }
    this[key] = docIndex.docindex_conf[key];
  }, this);
  // Set nosidebarhide from final
  // docIndex.nosidebarhide = this.nosidebarhide ? 1 : 0;
  // https://www.kirupa.com/html5/setting_css_styles_using_javascript.htm
  var sb = document.getElementById('sidebar');
  var dc = document.getElementById('doccontent');
  if (!sb) { return alert("No sidebar element !"); }
  if (!dc) { return alert("No doccontent element !"); }
  if (this.nosidebarhide) {
    docIndex.nosidebarhide = 1;
    sb.classList.add("sidebar_static");
    dc.classList.add("doccontent_shifter");
    
  }
  //docIndex.dump(this, "THIS(at end)");
  // return docindex_conf;
}


// docIndex.clone = function (x) { return JSON.parse(JSON.stringify(x));};
docIndex.inited = 0; // For e.g. storing converter instance
docIndex.dump = function (d, msg) { console.log((msg ? msg + ":" : "") + JSON.stringify(d, null, 2)); };
/** Default settings for docIndex.
* Settings override order illustrated:
* ```
*   ---------------
*   | Class Level | docIndex.docindex_conf - Most sane and good defaults
*   ---------------
*         |
*         V
*   ---------------------
*   | Instantiation level|  new docIndex({"...": "...", ..});
*   ---------------------
*         |
*         V
*   -----------------------
*   | Docindex JSON Config | /docindex.json
*   -----------------------
*       
* ```
*/
docIndex.docindex_conf = {
  //OLD: "filename": "docindex.json", // Document index "Table of contents" JSON filename. NEW: In loading call
  //OLD: "settitle": true,
  "postloadcb": null, // Post DocIndex JSON load callback, gets passed docindex.json data structure (top-Object)
  "linkproc": "none", // HTML Anchor / link processing policy (none,post,auto)
  // ID:s and classes. TODO: Change to selectors ?
  "pagetitleid": "pagetitle", // Page title element id inside HTML body (default: "pagetitle", which works for the bundled default page)
  "doclistid": "sidebar", // Doc Listing sidebar element ID to present as Accordion (default: "sidebar")
  "docareaid": "doccontent", // Document HTML content display area (default: "doccontent")
  //"doclinkclass": "dlink", // Selector (likely class) for doc links. NOW: Internal (see: gendoclist() => "dlink")
  "acc": false, // Use JQuery UI (collapsible) Accordion (default: false)
  "avoidcaching": true, // Add timestamp to links to work around strong caching tendencies
  "debug": 0, // Produce verbose messages to console (at various parts of execution)
  // "ondocchange": null, // Docchange callback to attach to docIndex.ondocchange. Cancelled. Set directly to docIndex
  "settitle": 0  // Set Page title if exists in docindex.json (and if pagetitleid is set and the element is found)
};

/** Convert AoO to Simple UL -list of doc links.
* @param docarr {array} - Array of Document Objects (as part of docindex.json)
* @return HTML content (UL list) for single document group
*/
docIndex.gendoclist = function (docarr) {
  
  var cont = "<ul>\n";
  docarr.map(function (item) {
     // if (!item.type) { return; } // Do NOT mandate
     cont += "<li><a class=\"dlink\" href=\""+ item.urlpath +"\" data-did=\""+item.id+"\">"+ item.title +"</a></li>\n";
  });
  cont += "</ul>\n";
  return(cont);
};
/** Convert Docindex to grouped list suitable for (JQuery UI) Accordion.
*
* Automatically detects whether docindex has groups or not, and does the
* "right thing".
* @param data {object} Document Index Declaration Object
* @return HTML Content for a doc navigation area
*/
docIndex.gendoclist_grp = function (data) {
  // Create groups
  var groupnames = data.groups; // {}
  if (!data.docs) { return alert("No Docs section in JSON"); }
  if (!Array.isArray(data.docs)) { return alert("Docs section not in Array");}
  // NEW: Generate link id:s
  var id = 1;
  data.docs.forEach(function (doc) { doc.id = id; id++; });
  if (!groupnames) { return docIndex.gendoclist(data.docs); } // Single flat list w. No group title
  
  var grps = {}; // Temp/local only (!)
  
  data.docs.forEach(function (doc) { grps[doc.grp] = []; }); // Init ONLY (grp discovered from doc - to [])
  // For each of groups create content
  var cont = "";
  var grpkeys = Object.keys(grps);
  data.docs.forEach(function (doc) { grps[doc.grp].push(doc); });
  data.debug && console.log("GROUPS:"+JSON.stringify(grps, null, 2)); // DEBUG
  grpkeys.forEach(function (gk) {
    cont += "<h3>" + (groupnames[gk] || gk) + "</h3>\n\n";
    cont += "<div>\n"; // For Accordion
    cont += docIndex.gendoclist(grps[gk]);
    cont += "</div>\n"; // For Accordion
  });
  return(cont);
};


// function hasgroups(data) {return data.filter(function (it) { return it.grp; }).length; }
// function hasgroups(data) {return data.groups; }

/** Document link click event handler.
* - Loads raw MD Document (by href URL) and Converts it to HTML (if not already HTML).
* - Supports HMTL docs (w/o html/head/body wrappings) without conversion
* - Converts links to HTML anchor elements (as configured by conversion policy)
*   - config options for converting links: none, post, auto (applied both in converted md, in raw html)
* - Places converted HTML content into DIV named 'doccontent'
*  sidebar and doccontent are animated with fadein / fadeout during transition.
* 
* Allow application to intercept doc change event with callback attached to docIndex.ondocchange (e.g.):
* 
*     docIndex.ondocchange = function (docurl) { console.log("Loaded doc:" + docurl); }
*
* @param ev {object} Click Event on document link.
* @todo Support 
*/
docIndex.onDocClick = function (ev) {
  ev.preventDefault();
  //console.log("Click on: " + ev.target);
  
  //var url = $(ev.target).attr("href");
  var url = ev.target.getAttribute("href");
  var url_f = url;
  // Prevent caching ?
  if (docIndex.docindex_conf.avoidcaching) {var ms = new Date().getTime();url_f += "?t=" + ms;}
  //$('#doccontent').append(url); // DEBUG
  // TODO: Move to docIndex.docLoad / docDisplay
  function onDocLoad(data) {
    if (!data) { return alert("Requested Document could not be loaded !"); }
    var cfg = docIndex.docindex_conf;
     // TODO: Preprocess URL:s to avoid '_' in URL:s to become emphasis (<em>)
     // This will be somewhat tricky. For now - live with it.
     // Convert MD->HTML
     var ht; var htdebug = 1;
     if (url_f.match(/\.html$/)) { ht = data; } // Simple HTML support (No conversion)
     // TODO: more checks here to support more diverse content (pdf ? svg ?)
     else {
       ht = docIndex.converter.makeHtml(data);
       cfg.debug && console.log("Converted: " + data.length +" B (MD) to "+ht.length+" B (HTML)");
     }
     // cfg.debug > 1
     if (htdebug) { console.log("HTML from "+url_f+" before link-conversion:\n"+ht); }
     ////////////////// Link Conversion "Heuristics" /////////////////////
     // Additionally convert links by current policy ... (none, post, auto)
     cfg.debug && console.log("Convert links by policy: "+cfg.linkproc);
     //var lp = cfg.linkproc;
     if (cfg.linkproc == "none") {}
     // Removed "\<" escapes as "unnecessary" (jshint: Unexpected escaped character '<' in regular expression.)
     // Convert to link
     // NEW: Add extra space **back in** (just before "<a ")in replace(.., " <a ...") as
     // match(/[^"]/..) "eats" one whitespace. For cases where it gets added redundantly, the extra space
     // should not hurt anything (in HTML).
     else if (cfg.linkproc == "post") {
       // if ( ) {...
       ht = ht.replace(/[^"](\bhttps?:\/\/[^\s<>]+)/g, " <a target=\"other\" href=\"$1\" title=\"$1\">$1<\/a>");
     }
     // Auto mode means that if no links are found, only then conversion will kick in.
     else if ((cfg.linkproc == "auto") && ! ht.match(/<a\s+/)) {
       
       ht = ht.replace(/[^"](\bhttps?:\/\/[^\s<>]+)/g, " <a target=\"other\" href=\"$1\" title=\"$1\">$1<\/a>");
     }
     if (docIndex.ondocchange && (typeof docIndex.ondocchange == 'function')) { docIndex.ondocchange(url_f); }
     if (htdebug) { console.log("HTML from "+url_f+" after link-conversion:\n"+ht); }
     ////////////////////// Display /////////////////////////
     //$('#doccontent').html(ht); // OLD, JQ-coupled
     document.getElementById(cfg.docareaid).innerHTML = ht; // OLD: 'doccontent'
     if (window.$) {
       if (!docIndex.nosidebarhide) {  $('#'+cfg.doclistid).fadeOut(); }// .hide() // "#sidebar"
       $('#'+cfg.docareaid).fadeIn(); // .show() // '#doccontent'
     }
     return false;
  }
  // TODO: Move callback to .done()
  // TODO: Support other http loading
  /*
  var jqxhr = $.get(url_f, onDocLoad)
  .fail(function(err) {
    alert( "Error Loading doc ('" + url + "') - " + err.statusText); // JSON.stringify(this) JSON.stringify(err)
  });
  */
  docIndex.htget(url_f, onDocLoad);
};
/** Click Handler for navigating "Back to Index".
* @param ev {object} Click Event on "Back to Index" link.
*/
docIndex.onIndexClick = function (ev) {
  if (!$) { return false; }
  if (!docIndex.nosidebarhide) { $('#sidebar').fadeIn(); } // Not neded as we hardly click on doc "back to index" ?
  $('#doccontent').fadeOut();
  return false;
};
/** Initialize Doc Listing with doc index (JSON) data.
 * - Allow overriding current setting for this.debug by data.debug
 * - Allow overriding docIndex.docindex_conf.linkproc by data.linkproc
 * - Apply postloadcb callback (if configured) as needed (passing data to it)
 * - Hook callback to load documents on demand (on click event).
 * - 
 * @param data {object} Document Index (docindex.json) JSON data (See main doc for explanation of structure).
 */
docIndex.prototype.initdocs = function(data) {
    // TODO: Allow filtering entries by certain attribute (e.g. owner or pattern in name)
    // filter ?
    // if (this.filtercb && (typeof this.filtercb == 'function')) {
    //    data[???] = data[???].filter(this.filtercb);
    // }
    if (!data) { return alert("No Doc Index structure returned"); }
    if (typeof data != 'object') { return alert("Doc Index is not in correct (JSON Object) format"); }
    // Various settings from docindex.json. Set both to this and docIndex.docindex_conf
    // (As this may not be avail e.g. in onDocClick).
    if (data.debug)    { this.debug = data.debug; docIndex.docindex_conf.debug = data.debug; }
    if (data.linkproc) { this.linkproc = data.linkproc; docIndex.docindex_conf.linkproc = data.linkproc; }
    //console.log(this);
    this.debug && console.log("Docindex w. " +data.docs.length+ " docs, " +Object.keys(data.groups || {}).length+ " groups.");
    // Validate data.docs and (optional) data.groups here ?
    if (!Array.isArray(data.docs)) { return alert("No 'docs' section (as Array) in docIndex !"); }
    
    if (this.postloadcb && (typeof this.postloadcb == 'function')) { this.postloadcb(data); }
    var title = data.title || "Misc. Markdown Docs";
    var telid = this.pagetitleid || 'pagetitle'; // telid = Title element id
    if (title && this.settitle) { document.getElementsByTagName('title')[0].innerHTML = title; }
    var tel = document.getElementById(telid); // Note: gets set only if found
    if (title && tel && telid) { tel.innerHTML	= title; } // From config
    // Default Doc
    var defdocnode;
    // Allow number
    if (typeof data.defdoc != 'undefined') {
      
      if ((typeof data.defdoc == 'number') ) {
        defdocnode = data.docs[data.defdoc];
      } // && data.defdoc.match(//)
      else if (typeof data.defdoc == 'string') {
        defdocnode = data.docs.find(function (d) { return d.urlpath == data.defdoc; });
      }
      
    }
    // $('head title').html(title); $('#pagetitle').html(title);
    // Simple linear list
    //OLD:var cont = docIndex.gendoclist(data);
    // If there are groups (?)
    //OLD: if (hasgroups(data)) { cont = docIndex.gendoclist_grp(data); }
    function doclist_init(data) {
      var cont = docIndex.gendoclist_grp(data);
      // $('#sidebar').html(JSON.stringify(data)); // DEBUG
      //$('#sidebar').html(cont);
      document.getElementById('sidebar').innerHTML = cont;
      // Click on doclink
      //$('.dlink').click(docIndex.onDocClick);
      var els = document.getElementsByClassName('dlink');
      // console.log(els);
      
      var len = els.length;
      this.debug && console.log(len + "Doc Items");
      // Note: for (i in els) dos not work but adds other stuff to  (e.g. key "item" to list)
      // forEach() likely sets this for interfering value
      //els.forEach(function (el) {
      for (var i=0;i<len;i++) {
        var el = els[i];
        //console.log("Item: " + i);
        el.addEventListener('click', docIndex.onDocClick); // [, options]
      } // );
    }
    doclist_init(data);
    this.docs = data.docs;
    // TODO: Use configurable ID
    var ilink = document.getElementById('index');
    if (ilink) { ilink.addEventListener('click', docIndex.onIndexClick); } // [, options]
    // $('#index').click(docIndex.onIndexClick);
    // Accordion Options and Instantiation
    // Add: "header": "h4",
    var aopts = this.aopts || {autoHeight: false, navigation: true, collapsible: true, heightStyle: "content"};
    
    if (this.acc) {
      // Moved inside this.acc condition (esp. because of return !)
      if (!$) { console.error("JQuery missing, not able to create Accordion."); return; }
      $("#sidebar").accordion(aopts);
    }
    // Optional autoload of default docIndex.onDocClick (https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events)
    // 
    // 
    if (defdocnode) {
      
      var el = $("[href='"+defdocnode.urlpath+"']").get(0);
      if (el) {
        // NOTE: Triggering this event (displaying for default doc on same page)
        // on Safari (12.1.1 (13607.2.6.1.2)) causes a unintended navigation (from SPA app URL) to URL of doc
        // (showing doc as sole content). This seems to be timing related and does not recur when
        // clicking the hyperlink. TODO: Try delaying event trigger by setTimeout().
        // We could just load the doc into configured docarea instead of triggering click (click == the easy away),
        // but most valuable reusable onDocLoad is within onDocClick
        var event = new Event('click');
        el.dispatchEvent(event);
      }
    }
  };
/** Get Document item by it's id.
* Id's are assigned 
*/
docIndex.prototype.docitem = function (did) {
  if (!this.docs) { console.error("No docs member to find from"); return undefined; }
  if (!Array.isArray(this.docs)) { console.error("docs not in Array (for find())"); return undefined; }
  
  return this.docs.find(function (doc) { return doc.id == did; });
};
/** Fetch file by http (GET) with 0-Dependencies (with Browser built-in XHR).
* Auto-Parses JSON content to data structure, leaves anything else as-is to be processed by cb.
* @param url {string} - URL string
* @param cb {function} - Callback to call with result content (as only param)
* @todo Refine callback to recieve: `(err, data)` instead of `(data)`, except JQuery 
*/
docIndex.htget = function (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  //xhr.setRequestheader(name, val); // No special headers ?
  var onrsc = function () {
    var rs = xhr.readyState;
    // docIndex.debug && console.log("XHR rs("+url+"): " + rs);
    // Every request should go through state 4
    if (rs == 4) {
      console.log("XHR:", xhr);
      var ct = xhr.getResponseHeader("Content-Type");
      // Completion-only status analysis
      if (xhr.status == 200) {
        // try {
        // var data;
        if (ct.match(/\bjson\b/)) { cb(JSON.parse(xhr.responseText)); }
        else { cb(xhr.responseText); } // ,null
        //} catch(ex) { cb("Could not Parse JSON", null); }
        
      }
      // Any non-200 status is not okay.
      else { cb(null); }
      // else { cb("Error: Non-200 Status:"+xhr.status, null); }
    }
    
  };
  xhr.onreadystatechange = onrsc;
  xhr.send(); // No body on GET
};
