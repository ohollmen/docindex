// $(document).ready(function ()
window.onload = function () {
  // Instantiate docIndex. Load index "TOC" with initdocs() method.
  docIndex.ondocchange = function (docurl) { console.log("DOC-CHANGE: "+docurl); };
  var cfg = new docIndex({acc: 0, linkproc: "post", settitle: 1, debug: 1, nosidebarhide: 1});
  // TODO: cfg.filename
  // Original JQuery way
  // $.getJSON("docindex.json", function (d) { cfg.initdocs(d); });
  docIndex.htget("docindex.json", function (d) { cfg.initdocs(d); });
};
