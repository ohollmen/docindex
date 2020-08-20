/** @file
*
* ## Docindex - Simple way of creating Markdown Doc collection pages
*
* Provides a basic toolkit for building simple markdown documentation pages
* with documents grouped by topic. Focus is on organized collection of documents, not a single doc.
* 
* Docindex has very low dependencies:
* - JQuery is currently used for loading docindex.json and MD docs.
* - JQuery UI can provide Accordion option when "acc" option is set.
*
* ### DocIndex JSON Format
* 
* Expects server to contain a JSON file in simple format describing
* docs and groups (JSON decorating with JS comments for doc and tutoring purposes, do not have these in your docindex.json):
*
*      {
*        "title": "Crafts, Sports and Historical Gallery",
*        "groups": {
*          "crafts": "Crafts and Arts",
*          "sports": "World of Sport",
*          "history": "Historical Events",
*          // ...
*        },
*        "docs" : [
*          {
*            // Title as it appears on Docindex accordion.
*            "title": "Ted Williams - Greatest Baseball Hero", 
*            "urlpath": "ted_williams.md", // URL to doc (relative to curr page)
*            "grp": "sports" // Optional Group that doc belongs to (See "groups" above)
*            
*          }
*          // ...
*        ]
*      }
*
* Format has following members and sections (on top level):
* 
* - "title"  - Title (string) of Document page
* - "docs"   - Array of Objects with each doc declared by title,urlpath,grp (See below)
* - "groups" - Optional grouping of documents (in Object)
*   - Missing "groups" will be auto-detected and sane behaviour will be
*     triggered
*   - Groups will appear as (JQuery UI) Accordion items on page
*
* As further demonstrated by example docindex.json (above) the object nodes in "docs" have
* following members:
* 
* - "title"   - Name of the Doc as it should appear in left side doclisting.
* - "urlpath" - URL of document (relative to docroot or current URL of web server)
* - "grp"     - Group that doc should fall under (when using groups)
* 
* ## Setting up Docindex
* 
* ### Installing from Github or NPM
* 
* Make sure you have either `npm` or `yarn` package manager installed on your system.
* From Github:
* 
*       npm install ohollmen/docindex
*       # ... OR ...
*       yarn add ohollmen/docindex
* 
* From NPM:
* 
*       npm install docindex
*       # ... OR ...
*       yarn add docindex
*
* ### Docindex HTML Page
* 
* HTML Page that docindex uses must have 2 divs with specific id:s declared:
* - sidebar - Left side document listing and navigation area
* - doccontent - Area to display document in
* 
* See section "Config Options ..." and "doclistid" and "docareaid" for configurability.
* Example HTML fragment for `"sidebar"` and `"doccontent"` areas
* ``` 
* ...
* <div id="content">
<!-- Document navigation -->
<div id="sidebar"></div>
<!-- Doclist Content goes here -->
<div id="doccontent" style="display: none;"></div>
</div>
...
* ```
* ### Using Docindex in your JS
*
*      window.onload = function () {
*        // Create docIndex with settings overriden (as needed)
*        var cfg = new docIndex({linkproc: "post"});
*        // Load Doc index file and group listings data.
*        $.getJSON("docindex.json", function (d) { cfg.initdocs(d); });
*      };
* 
* ### Config Options for docIndex
* 
* Allow passing in configuration with:
* 
* - "postloadcb" - Post DocIndex JSON load callback, gets passed docindex.json data structure (default: none). Allows manipulating (e.g. filtering) structure, no need to return value.
* - "linkproc" - HTML Anchor / link processing policy (none,post,auto, default: none) - See below
* - "pagetitleid" - Page title element inside HTML body (default: "pagetitle", which works for the bundled default page)
* - "doclistid" - Doc Listing sidebar element ID to present as Accordion (default: "sidebar")
* - "docareaid" -  Document HTML content display area (default: "doccontent")
* - "acc" - Use JQuery UI (collapsible) Accordion (default: false)
* - "avoidcaching" - Set additional unique parameters (without specific meaning) on URL:s
*    to avoid caching (on client side)
* - "debug" - Produce verbose messages to console (at various parts of execution)
* 
* Whenever defaults are good - you don't need to bothe passing anything.
*
* ### URL Link (URL-to-HTMLanchor) conversions
* 
* There are 3 options to process URL Links to HTML Anchor ("a") elements:
* 
* - none - No processing or conversions are done
* - auto - If anchor ("a") elements are detected in document it is assumes that MD author
*     had all URL:s she/he wants as links authored as anchors already in MD markup. If no
*     links are found full URL-to-anchor conversion is 
* - post - All remaining non-anchor URL:s in document are unconditionally converted.
* 
* ## Web server
*
* Run any web server capable of delivering static content.
* You should be able to test your docindex.json by simply creating a symlink from your document directory to bundled docindex.html (e.g.):
*
*      ln -s node_modules/docindex/docindex.html docindex.html
* 
* Example for running python (lightweight) web server - good at least for testing:
*
*      > python -m SimpleHTTPServer
*      Serving HTTP on 0.0.0.0 port 8000 ...
* 
* 
* Access the page via URL: http://localhost:8000/docindex.html (Use as basename whatever
* name you created symlink by).
* 
* ## Usage forms of docindex
* 
* - Use as-is: Simple use case may allow to using the docindex.html example (and associated CSS) and docIndex module as is. Only create a docindex.json for *your* docs (docindex toolkit will use this to create docindex page).
* - Use almost as-is: Hack HTML and CSS to suite your need and style
* - Use as a toolkit: Above plus use individual calls to JS api
* - Use as an concept: You think that docindex is inflexible and sucks but
*   you need a similar solution to manage Markdown docs. Write your own !
*
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

/** Class / Constructor for docIndex.
* See Main doc for config options.
* @constructor
*/
function docIndex(cfg) {
  cfg = cfg || {};
  var debug = cfg.debug || docIndex.docindex_conf.debug || 0;
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
  
  //self = docIndex.docindex_conf;
  var keys = Object.keys(docIndex.docindex_conf);
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
docIndex.inited = 0;
docIndex.dump = function (d, msg) { console.log((msg ? msg + ":" : "") + JSON.stringify(d, null, 2)); };
// Default settings for docIndex.
docIndex.docindex_conf = {
  // "filename": "docindex.json", // Document index "Table of contents" JSON filename
  // "settitle": true, // Set Page title if exists in docindex.json
  "postloadcb": null, // Post DocIndex JSON load callback, gets passed docindex.json data structure
  "linkproc": "none", // HTML Anchor / link processing policy (none,post,auto)
  // ID:s and classes. TODO: Change to selectors ?
  "pagetitleid": "pagetitle", // Page title element inside HTML body (default: "pagetitle", which works for the bundled default page)
  "doclistid": "sidebar", // Doc Listing sidebar element ID to present as Accordion (default: "sidebar")
  "docareaid": "doccontent", // Document HTML content display area (default: "doccontent")
  //"doclinkclass": "dlink", // Selector (likely class) for doc links
  "acc": false, // Use JQuery UI (collapsible) Accordion (default: false)
  "avoidcaching": true, // Add timestamp to links to work around strong caching tendencies
  "debug": 0, // Produce verbose messages to console (at various parts of execution)
  // "ondocchange": null, // Docchange callback to attach to docIndex.ondocchange. Cancelled. Set directly to docIndex
  "settitle": 0
};

/** Convert AoO to Simple UL -list of doc links.
* @param docarr {array} Array of Document Objects (as part of docindex.json)
* @return HTML content (UL list) for single document group
*/
docIndex.gendoclist = function (docarr) {
  
  var cont = "<ul>\n";
  docarr.map(function (item) {
     // if (!item.type) { return; } // Do NOT mandate
     cont += "<li><a class=\"dlink\" href=\""+ item.urlpath +"\">"+ item.title +"</a></li>\n";
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
  if (!Array.isArray(data.docs)) { return alert("Docs section not in Array");}
  if (!groupnames) { return docIndex.gendoclist(data.docs); }
  
  var grps = {};
  data.docs.forEach(function (doc) { grps[doc.grp] = []; }); // Init ONLY
  // For each of groups create content
  var cont = "";
  var grpkeys = Object.keys(grps);
  data.docs.forEach(function (doc) { grps[doc.grp].push(doc); });
  //console.log(JSON.stringify(grps, null, 2)); // DEBUG
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
* - Loads raw MD Document (by href URL) and Converts it to HTML.
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
  function onDocLoad(data) {
    var cfg = docIndex.docindex_conf;
     // TODO: Preprocess URL:s to avoid '_' in URL:s to become emphasis (<em>)
     // This will be somewhat tricky. For now - live with it.
     // Convert MD->HTML
     var ht;
     if (url_f.match(/\.html$/)) { ht = data; } // Simple HTML support.
     else { ht = docIndex.converter.makeHtml(data); }
     cfg.debug && console.log("Converted: " + data.length +" B (MD) to "+ht.length+" B (HTML)");
     // Additionally convert links by current policy ...
     //var lp = cfg.linkproc;
     if (cfg.linkproc == "none") {}
     // Removed "\<" escapes as "unnecessary" (jshint: Unexpected escaped character '<' in regular expression.)
     // Convert to link
     else if (cfg.linkproc == "post") {
       // if ( ) {...
       ht = ht.replace(/(\bhttps?:\/\/[^\s<>]+)/g, "<a target=\"other\" href=\"$1\" title=\"$1\">$1<\/a>");
     }
     // Auto mode menas that if no links are found, only then conversion will kick in.
     else if ((cfg.linkproc == "auto") && ! ht.match(/<a\s+/)) {
       
       ht = ht.replace(/(\bhttps?:\/\/[^\s<>]+)/g, "<a target=\"other\" href=\"$1\" title=\"$1\">$1<\/a>");
     }
     // console.log(ht); // Re DEBUG
     if (docIndex.ondocchange && (typeof docIndex.ondocchange == 'function')) { docIndex.ondocchange(url_f); }
     //$('#doccontent').html(ht);
     ////////////////////// Display /////////////////////////
     document.getElementById('doccontent').innerHTML = ht;
     if ($) {
       if (!docIndex.nosidebarhide) {  $('#'+cfg.doclistid).fadeOut(); }// .hide() // "#sidebar"
       $('#'+cfg.docareaid).fadeIn(); // .show() // '#doccontent'
     }
     return false;
  }
  // TODO: Move callback to .done()
  // TODO: Support other http loading
  var jqxhr = $.get(url_f, onDocLoad)
  .fail(function(err) {
    alert( "Error Loading doc ('" + url + "') - " + err.statusText); // JSON.stringify(this) JSON.stringify(err)
  });
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
/** Initialize Doc Listing with doc index data.
 * Hook callback to load documents on demand (click event).
 * @param data {object} Documemt Index (docindex.json) JSON data (See main doc for explanation of structure).
 */
docIndex.prototype.initdocs = function(data) {
    // TODO: Allow filtering entries by certain attribute (e.g. owner or pattern in name)
    // filter ?
    // if (this.filtercb && (typeof this.filtercb == 'function')) {
    //    data[???] = data[???].filter(this.filtercb);
    // }
    if (typeof data != 'object') { return alert("Doc Index is not in correct (JSON Object) format"); }
    this.debug && console.log("Docindex w. " +data.docs.length+ " docs, " +Object.keys(data.groups || {}).length+ " groups.");
    // Validate data.docs and (optional) data.groups here ?
    if (!Array.isArray(data.docs)) { return alert("No 'docs' section in docIndex !"); }
    
    if (this.postloadcb && (typeof this.postloadcb == 'function')) { this.postloadcb(data); }
    var title = data.title || "Misc. Markdown Docs";
    var telid = this.pagetitleid || 'pagetitle';
    if (title && this.settitle) { document.getElementsByTagName('title')[0].innerHTML = title; }
    var tel = document.getElementById(telid);
    if (title && tel && telid) { tel.innerHTML	= title; } // From config
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
    // TODO: Use configurable ID
    var ilink = document.getElementById('index');
    ilink.addEventListener('click', docIndex.onIndexClick); // [, options]
    // $('#index').click(docIndex.onIndexClick);
    // Accordion Options and Instantiation
    // Add: "header": "h4",
    var aopts = this.aopts || {autoHeight: false, navigation: true, collapsible: true, heightStyle: "content"};
    if (!$) { console.error("JQuery missing, not able to create Accordion."); return; }
    if (this.acc) {
      $("#sidebar").accordion(aopts);
    }
  };

