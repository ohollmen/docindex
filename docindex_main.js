// $(document).ready(function ()
window.onload = function () {
  // Instantiate docIndex. Load index "TOC" with initdocs() method.
  var cfg = new docIndex({acc: 0, linkproc: "post"});
  // TODO: cfg.filename
  $.getJSON("docindex.json", function (d) { cfg.initdocs(d); });
};
