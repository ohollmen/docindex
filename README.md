## Docindex - Simple way of creating Markdown Doc collection pages

Provides a basic toolkit for building simple markdown document pages
with documents grouped by topic.

Docindex has very low dependencies:
- JQuery is currently used for loading docindex.json and MD docs.
- JQuery UI can provide Accordion option when "acc" option is set.

### DocIndex JSON Format

Expects server to contain a JSON file in simple format describing
docs and groups (JSON decorating with JS comments for doc and tutoring purposes, do not have these in your docindex.json):

      {
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

Format has following members and sections (on top level):

- "title"  - Title (string) of Document page
- "docs"   - Array of Objects with each doc declared by title,urlpath,grp (See below)
- "groups" - Optional grouping of documents (in Object)
  - Missing "groups" will be auto-detected and sane behaviour will be
    triggered
  - Groups will appear as (JQuery UI) Accordion items on page

As further demonstrated by example docindex.json (above) the object nodes in "docs" have
following members:

- "title"   - Name of the Doc as it should appear in left side doclisting.
- "urlpath" - URL of document (relative to docroot or current URL of web server)
- "grp"     - Group that doc should fall under (when using groups)

## Setting up Docindex

### Installing from Github or NPM

Maqke sure you have either `npm` or `yarn` package manager installed on your system.
From Github:

      npm install ohollmen/docindex
      # ... OR ...
      yarn add ohollmen/docindex

From NPM (If this made it's way to NPM):

      npm install docindex
      # ... OR ...
      yarn add docindex

### HTML Page

HTML Page that docindex uses must have 2 divs with specific id:s declared:
- sidebar - Left side document listing and navigation area
- doccontent - Area to display document in

See section "Config Options ..." and "doclistid" and "docareaid" for configurability.

### Using Docindex in your JS

     window.onload = function () {
       // Create docIndex with settings overriden (as needed)
       var cfg = new docIndex({linkproc: "post"});
       // Load Doc index file and group listings data.
       $.getJSON("docindex.json", function (d) { cfg.initdocs(d); });
     };

### Config Options for docIndex

Allow passing in configuration with:

- "postloadcb" - Post DocIndex JSON load callback, gets passed docindex.json data structure (default: none). Allows manipulating (e.g. filtering) structure, no need to return value.
- "linkproc" - HTML Anchor / link processing policy (none,post,auto, default: none) - See below
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

     ln -s node_modules/docindex/docindex.html docindex.html

Example for running python (lightweight) web server - good at least for testing:

     > python -m SimpleHTTPServer
     Serving HTTP on 0.0.0.0 port 8000 ...


Access the page via URL: http://localhost:8000/docindex.html (Use as basename whatever
name you created symlink by).

## Usage forms of docindex

- Use as-is: Simple use case may allow to using the docindex.html example (and associated CSS) and docIndex module as is. Only create a docindex.json for *your* docs (docindex toolkit will use this to create docindex page).
- Use almost as-is: Hack HTML and CSS to suite your need and style
- Use as a toolkit: Above plus use individual calls to JS api
- Use as an concept: You think that docindex is inflexible and sucks but
  you need a similar solution to manage Markdown docs. Write your own !

## Running the Included Demo

You either cloned docIndex from git or installed it by NPM (or yarn).

Flow for Git Install, run in the top level ("docindex") directory of the clone:
    
    # npm or yarn install for dependencies
    npm install
    # Cannot Install docindex itself by NPM rules (npm install docindex) !
    # So fake "docindex as dependency of itself" by a symlink:
    pushd node_modules; ln -s .. docindex ; popd
    # Usess included docindex file (docindex.demo.json)
    # Run web server (of your preference, here minimal python web server for static content)
    python -m SimpleHTTPServer
    # Look at URL http://localhost:8000 with browser

Flow for NPM based install (for another app, which has docindex in package.json or by running npm install docindex woithout any
package.json driving the installation):

    cd node_modules/docindex
    # Make appropriate symlinks
    ln -s .. node_modules
    # Or brute force install dependencies in sub-directories of "docindex"
    # npm install
    # Run web server ... (see above)
    python -m SimpleHTTPServer


