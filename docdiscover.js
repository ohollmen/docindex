#!/usr/bin/env node
/** Document discovery collector.
* - Finds / gathers documents from a directory from single level listing
* or recursivelyfrom it's whole sub-directory tree.
* - Additionally groups them if grouping config is present in current dir.
* Allow ignoring docs by file patterns from ".docignore" (currently match from beginning or relative name supported).
*/
var fs   = require("fs");
var path = require('path');
//let { parseArgs } = require("util");
let util = require("util"); // Also "node:util" (for util.parseArgs). Must have node > 16.14.0 to have parseArgs
// Test e.g. ../
// TODO: Add maxtitlelen: 80
let cfg = {
  "rootpath": '.', // TODO: "docroot": ...
  //"re": /\.txt$/g,
  // In str version should escape dot w. double shals, to *really* get 
  "re": "\\.md$", // fnre, suffre, pathre ?
  "title": "Doc Index",
  "debug": 0,
};
/** Turn list of files (w. full rel or abs name) to nodes w. rootpath relative names.
 * 
 */
// What is the best way to normalize path to relative in nod.js (using path module). The behaviour of `var rel = path.relative(rootpath, fn);` seems to be quirky and unintuitive. I'd like a function that strips the rootpath (that may be r4rlative or absolute) from the beginning of 
function files2nodes(files, rootpath, opts) {
  opts = opts || { keepcont: 0 };
  var docs = files.map(function(fn) {
    // my $relative_path = File::Spec->abs2rel($absolute_path, $base_directory);
    // These have become redundant as fn above is already relative to the rootpath.
    //var norm = path.normalize(fn); // OK (clean up)
    //var rel = path.relative(rootpath, fn); // OK
    //console.log(`Got fn variants:\n- fn: ${fn}\n- norm: ${norm}\n- rel: ${rel}`); // NOT: return fn;
    // OLD: Do not use norm, use rel NEW: Use fn, already root-relative
    var node = { urlpath: fn, title: "", grp: "" };
    let fnf = `${rootpath}/${fn}`;
    node.mdcont = fs.readFileSync(fnf, 'utf8');
    var m;
    if (node.mdcont && (m = node.mdcont.match(/^#\s+(.+)$/m))) {
      node.title = m[1];
    }
    if (!node.title) {
      var bn = path.basename(fn);
      node.title = "Untitled doc ("+bn+")";
    }
    //node.norm = norm;
    //node.rel = rel;
    delete(node.mdcont); // Done sampling content - discard !
    return(node);
  });
  return docs;
}


//var recursive = require("recursive-readdir");
//recursive("some/path", function (err, files) { console.log(files);});

/** Test Doc titles for group matches (by RegExp)
* TODO: Pre-populate regexp:s
*/
function docs_group(docs, grps) {
  var gsel = grps.mappings;
  if (!gsel) { console.error(`No doc group mappings !`); return null; }
  grps.groups = grps.groups || {};
  var mcnt = gsel.length;
  console.error(`${mcnt} Group patt nodes to apply`);
  // Iterate files
  docs.forEach(function (doc) {
    if (typeof doc != 'object') { console.error(`doc ${doc} is not an object !`); return; }
    for (var i = 0;i < mcnt; i++) {
      var gs = gsel[i];
      var titlere = new RegExp(gs.patt, 'i');
      
      if (doc.title.match(titlere)) {
        doc.grp = gs.grp;
        // Break out of trying patterns
        break;
      }
      
    };
    if (!doc.grp) { doc.grp = 'misc'; }
  });
  if (!Object.keys(grps.groups).length) { grps.groups = null; }
  return grps.groups;
}
function docignore_load(rootpath) {
  let ignfn = `${rootpath}/.docignore`;
  let has_ign = fs.existsSync(ignfn);
  if (!has_ign) { console.error(`No .docignore`); return null; }
  var jcont = fs.readFileSync(ignfn, 'utf8');
  let ignarr = jcont.split(/\n/);
  ignarr = ignarr.map( (fpatt) => { return fpatt.trim(); });
  ignarr = ignarr.filter( (fpatt) => { return fpatt; });
  if (!ignarr.length) { console.error(`No .docignore patterns remain (after filtering)`); return null; }
  return ignarr;
}
function docignore_filter(files, ignarr) {
  // Filter relative with no slash in front !
  /*
  newarr = [];
  files.forEach( (fn) => { 
    let ignore = 0;
    ignarr.forEach( (ipatt) => {
      // string.startsWith(substring, position);
      if (fn.startsWith(ipatt)) { ignore = 1; return; }
      
    } );
    if (!ignore) { newarr.push(fn); }
    
  });
  return newarr;
  */
  // Run .filter() directly
  return files.filter(ignorecb)
  
  function ignorecb(fn) {
    let ignore = 0;
    /*
    
    ignarr.forEach( (ipatt) => {
      if (fn.startsWith(ipatt)) { ignore = 1; return; }
    });
    if (!ignore) {return 1; }
    */
    // 3-part for (surprisingly) creates the simpliest code here (!)
    for (let i = 0;i < ignarr.length;i++) {
      if (fn.startsWith(ignarr[i])) { ignore = 1; break; }
    }
    return ! ignore;
  }
}
function list_flat(rootpath) {
  let files = fs.readdirSync(rootpath);
  files = files.filter(function (fn) {
    let fna = `${rootpath}/${fn}`;
    var stat = fs.statSync(fna);
    return stat.isDirectory() ? 0 : 1;
  });
  files = files.map( (fn) => {
    fullfile = path.normalize(`${rootpath}/${fn}`);
    fullfile = path.relative(cfg.rootpath, fullfile);
    return fullfile; // `${rootpath}/${fn}`;
  });
  return files;
}

function list_tree(dir, opts) {
  var results = [];
  fs.readdirSync(dir).forEach(function(file) {
    var fullfile = `${dir}/${file}`;
    let stat;
    try {
      stat = fs.statSync(fullfile);
    } catch (err) {
      console.error(`stat error on ${file}: rc=${err.code}`);
      return; // Skip *this* item
    }
    let isdir = stat.isDirectory()
    if (cfg.debug) console.log(`list_tree: File: ${fullfile} (DIR: ${isdir})`);
    if (stat && isdir) {
      
      results_add = list_tree(fullfile); // results.concat(list_tree(fullfile));
      if (results_add && results_add.length) {
        results = results.concat(results_add);
        //results = [...results, ...results_add];
      }
    }
    else if (!file.match(cfg.re)) {}
    else {
      fullfile = path.normalize(fullfile);
      fullfile = path.relative(cfg.rootpath, fullfile); // Use global (cfg) intentionally !
      results.push(fullfile);
    }
  });
  return results;
};
let optdef = {
  // args: [],
  options: {
    // Item can have multiple: true, default: ..., 
    help: { type: "boolean" },
    version: { type: "boolean" },
    rootpath: { type: "string" },
    suffre: { type: "string" },
    title: { type: "string" },
    format: { type: "string" },
    debug: { type: "boolean" },
  },
  // allowPositionals: true,
};
// TODO: Support subcommands.
let ops = [
  // {id: "list", title: "List Files discovered.", cb: null, },
  // {id: "gen", title: "Generate DocIndex (docindex.json) to stdout.", cb: null, },
  // {id: "help", title: "Help on Options.", cb: null, },
];
module.exports = {
  //
  docs_group: docs_group,
};
function usage(msg) {
  if (msg) { console.error(msg); }
  
  process.exit(1);
}

if (process.argv[1].match("docgather.js")) {
  /// Common init()
  let parsed = util.parseArgs(optdef);
  console.error(`CLI Opts Parsed: ${JSON.stringify(parsed)}`);
  if (parsed.values.rootpath) { cfg.rootpath = parsed.values.rootpath; }
  if (!fs.existsSync(cfg.rootpath)) { usage(`rootpath '${cfg.rootpath}' does not exist!`); }
  cfg.rootpath = path.normalize(cfg.rootpath); // Add or strip trailing '/' ? .normalize() keeps it
  console.error(`Using Normalized Root path: ${cfg.rootpath}`);
  cfg.ignarr = docignore_load(cfg.rootpath);
  if (parsed.values.suffre) { cfg.re = parsed.values.suffre; }
  cfg.re = new RegExp(cfg.re);
  ////////////// List //////
  let op = 'list';
  //files = list_flat(cfg.rootpath);
  files = list_tree(cfg.rootpath);
  console.error(`Filtering by filepatt-re: ${cfg.re}`);
  files = files.filter(function (it) { return it.match(cfg.re); });
  console.error(`${files.length} Files from ${cfg.rootpath}`); // process.exit();
  // Ignores processing. Because we do this early (to reduce processing) it would pay off to keep files list as relative names *all the time*
  
  if (cfg.ignarr) { files = docignore_filter(files, cfg.ignarr); console.error(`${files.length} Files after ignore-filtering (${cfg.ignarr.length} patterns)`); }
  else { console.error(`No .docignore found (in ${cfg.rootpath})`); }
  //if (op == 'list') { console.log(JSON.stringify(files, null, 2)); console.log(`${files.length} Files`); process.exit();}
  //process.exit();
  ////////////////// Generate ///////
  var docs = files2nodes(files, cfg.rootpath);
  var groups = null;
  let gmetafn = `${cfg.rootpath}/grpmeta.json`;
  let have_grpmeta = fs.existsSync(gmetafn);
  if (have_grpmeta) {
    var grps = require(gmetafn);
    if (!grps) { throw `Groups meta ${gmetafn} does not pass JSON parsing !!`; }
    // Classify !
    groups = docs_group(docs, grps);
  }
  // "Doc Index"
  var docindex = { title: cfg.title, "numdocs": docs.length,
    // 
    groups: groups ? groups : {}, docs: docs,
  };
  console.log(JSON.stringify(docindex, null, 2));
}
