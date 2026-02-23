## Docindex - Simple way of creating Markdown Doc collection pages

DocIndex provides a basic toolkit for building simple markdown documentation pages
with documents grouped by topic. Focus is on organized collection of documents, not a single doc.

Docindex has very low dependencies:
- JQuery is currently used for loading docindex.json and MD docs.
- JQuery UI can provide Accordion option when "acc" option is set.

### DocIndex JSON Format

DocIndex expects server to contain a JSON file in simple format describing
documents and their groupings (JSON decorating with JS comments for doc and tutoring purposes, do not have these in your docindex.json):
```
{
  "title": "Crafts, Sports and Historical Gallery",
  "groups": {
    "crafts": "Crafts and Arts",
    "sports": "World of Sport",
    "history": "Historical Events",
    // ...
  },
  "docs" : [
    {
     // Title as it appears on Docindex accordion.
     "title": "Ted Williams - Greatest Baseball Hero", 
     "urlpath": "ted_williams.md", // URL to doc (relative to curr page)
     "grp": "sports" // Optional Group that doc belongs to (See "groups" above)
    }
    // ...
  ]
}
```

Format has following members and sections (on top level):

- "title"  - Title (string) of Document page
- "docs"   - Array of Objects with each doc declared by title,urlpath,grp (See below)
- "groups" - Optional grouping of documents (in Object)
  - Missing "groups" will be auto-detected and sane behaviour will be
    triggered
  - Groups will appear as grouped left sidebar (JQuery UI Accordion) itemized list on page

As further demonstrated by example docindex.json (above) the object nodes in "docs" have
following members:

- "title"   - Name of the Doc as it should appear in left side doclisting.
- "urlpath" - URL of document (relative to docroot or current URL of web server)
- "grp"     - Group that doc should fall under (when using groups)
- "mdopts" - Markdown converter (showdown.js showdown.Converter()) instance additional options.

## Setting up Docindex

### Installing from Github or NPM

For "NPM Install" make sure you have either `npm` or `yarn` package manager installed on your system.

From Github using git (creates subdir docindex):
```
git clone https://github.com/ohollmen/docindex.git
```

From NPM:
      # Yarn or NPM
      npm install docindex
      # ... OR ...
      yarn add docindex
      # You can also try npm or yarn "install from github"
      # npm install ohollmen/docindex
      # yarn add ohollmen/docindex

### Docindex HTML Page

DocIndex provides you a universal (one-size-fits-all) default HTML index page named `docindex.html`.
While it may work for you, you can modify it to suit your needs or crate a blank-slate HTML page for yourself.

HTML Page that docindex uses must have 2 divs with specific id:s declared:
- sidebar - Left side document listing and navigation area
- doccontent - Area to display document in (typically, preferably "div" block element)

See section "Config Options ..." and "doclistid" and "docareaid" for configurability.
Example HTML fragment for `"sidebar"` and `"doccontent"` areas
``` 
...
<div id="content">
<!-- Left side document navigation -->
<div id="sidebar"></div>
<!-- Document Content goes here -->
<div id="doccontent" style="display: none;"></div>
</div>
...
```

### Using Docindex in your JS Applications

DocIndex allows you to easily integrate/embed it in to your application by following snippet.
```
     window.onload = function () {
       // Create docIndex with settings overriden (as needed)
       var cfg = new docIndex({linkproc: "post"});
       // Load Doc index file and group listings data.
       $.getJSON("docindex.json", function (d) { cfg.initdocs(d); });
     };
```
### Config Options for docIndex

Allow passing in configuration with:

- "postloadcb" - Post DocIndex JSON load callback, gets passed docindex.json data structure (default: none). Allows manipulating (e.g. filtering) structure, no need to return value.
- "linkproc" - HTML Anchor / link processing policy ("none","post","auto", default: "none") - See below
- "pagetitleid" - Page title element inside HTML body (default: "pagetitle", which works for the bundled default page)
- "doclistid" - Doc Listing sidebar element ID to present as Accordion (default: "sidebar")
- "docareaid" -  Document HTML content display area (default: "doccontent")
- "acc" - Use JQuery UI (collapsible) Accordion (default: false)
- "avoidcaching" - Set additional unique parameters (without specific meaning) on URL:s
   to avoid caching (on client side)
- "debug" - Produce verbose messages to console (at various parts of execution)

Whenever defaults are good - you don't need to bothe passing anything.

### URL Link (URL-to-HTMLanchor) conversions

There are 3 options to process URL Links to HTML Anchor ("a") elements:

- none - No processing or conversions are done
- auto - If anchor ("a") elements are detected in document it is assumes that MD author
    had all URL:s she/he wants as links authored as anchors already in MD markup. If no
    links are found full URL-to-anchor conversion is 
- post - All remaining non-anchor URL:s in document are unconditionally converted.

## Web server

Run any web server capable of delivering static content.
You should be able to test your docindex.json by simply creating a symlink from your document directory to bundled docindex.html (e.g.):

For NPM Install
```
ln -s node_modules/docindex/docindex.html docindex.html
```
For Github install (Assumes docindex git project got cloned to subdir "docindex"):
```
# subdir docindex of current directory)
ln -s docindex/docindex.html docindex.html
```

Examples for running python (lightweight, core module) web server (in the directory of docindex.json and docindex.html - going to http://localhost:8000/ you will get a directory listing,
the de-facto python web server default port is 8000).

In a normal case (of running python3, port 8000):
```
python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
In the rare case of still running Python 2.7 (port 8000):
```
python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...
```

Access the page via URL: http://localhost:8000/docindex.html (Use as trailing filename whatever
name you created symlink by).

## Usage forms of docindex

- Use as-is: Simple use case may allow to using the docindex.html example (and associated CSS) and docIndex module as is. Only create a docindex.json for *your* docs (docindex toolkit will use this to create docindex page).
- Use almost as-is: Hack HTML and CSS to suite your need and style
- Use as a toolkit: Above plus use individual calls to JS api
- Use as an concept: You think that docindex is inflexible and sucks but
  you need a similar solution to manage Markdown docs. Write your own !

## Running the Included docIndex Demo

Flow for No-node, Git-based demo, there is no need to install node.js or NPM at all (!).
However you do need git (included on MacOS and most Linux distributions, for Windows use "Git for Windows").
<!--
Flow for Git Install, run in the top level ("docindex") directory of the clone:
You either cloned docIndex from git or installed it by NPM (or yarn).

# npm or yarn install for dependencies
npm install
# Cannot Install docindex itself by NPM rules (npm install docindex) !
# So fake "docindex as dependency of itself" by a symlink:
# pushd node_modules; ln -s .. docindex ; popd
-->
```
# Clone by HTTP (or by SSH using git@github.com:ohollmen/docindex.git)
git clone https://github.com/ohollmen/docindex.git && cd docindex
# Clone main dependency showdown.js (default branch master)
git clone --depth 1 https://github.com/showdownjs/showdown.git
# Clone nice-to-have dependency "bootstrap" for its CSS styles (~3.3.7 => Git: v3.3.7, "You are in 'detached HEAD' state." is ok)
git clone --branch v3.3.7 --single-branch --depth 1 https://github.com/twbs/bootstrap.git
#ln -s docindex
mkdir node_modules && pushd node_modules && ln -s .. docindex && ln -s ../showdown showdown && ln -s ../bootstrap bootstrap && popd
# Sanity check: ls -al node_modules/
# Usess included docindex file (docindex.demo.json)
# Run web server (of your preference, here minimal python web server for static content)
python -m http.server
# Look at URL http://localhost:8000 with browser
```

Flow for NPM based install (for another app, which has docindex in package.json or by running npm install docindex without any
package.json driving the installation):
```
cd node_modules/docindex
# Make appropriate symlinks for docindex.html
ln -s .. node_modules
# Or brute force install dependencies in sub-directories of "docindex"
# npm install
# Run web server ... (similar to above)
python -m http.server
```

