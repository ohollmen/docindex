// $(document).ready(function ()
window.onload = function () {
  // Instantiate docIndex. Load index "TOC" with initdocs() method.
  docIndex.ondocchange = function (docurl) { console.log(`DOC-CHANGE: ${docurl}`); };
  var cfg = new docIndex({acc: 0, linkproc: "post", settitle: 1, debug: 1, nosidebarhide: 1});
  // TODO: cfg.filename
  // Modernization - support tables (even if not part of orginal MD spec, these are nearly a "must have")
  docIndex.converter.setOption('tables', true);
  // Original JQuery way (still works, but default to not depending on JQuery)
  // $.getJSON("docindex.json", function (d) { cfg.initdocs(d); });
  docIndex.htget("docindex.json", function (d) { cfg.initdocs(d); });
};
