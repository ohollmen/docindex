# DocIndex FAQ - Frequently Asked Questions

## Q: Where are the HTML converted from HTML files (on the filesystem) ?

A: They are nowhere on the Filesystem. Docindex was created to avoid this "convert Markown files to static HTML files" process.
Docindex downloads the Markdown files from server and converts them to HTML **in the browser**. This way you continue to author
and modify you Markdown files on server (never needing to convert them manually). You just view them as HTML in DocIndex (Sidenote: DocIndex
allows you also to view HTML files, see FAQ item below).

## Q: I have some "legacy" HTML documentation files around - can I view them via DocIndex ?
Yes you can. Just enter them info `docindex.json` document nodes using their original filename (e.g. "install.html") -
DocIndex will detect the file suffix and (**not** convert) use them as-is for viewing. However it is preferred that
these documentation files are **not a complete** HTML page with `<HTML>`, '<HEAD>` and `<BODY>` tags in them - but just a
fragment of HTML (inner "content" part of page). If HTML is a *complete page* the viewing experience will involve "undefined behaviour"
(e.g. there will be duplicated, nested "html", "head" and "body" sections for browser to parse / renede - this will lead to no good things).

## Q: Is there a script that generates the docindex.json or do I have to create it myself ?
A: For now you have to create it by yourself. On the outher hand the docindex.json content downloaded from server could
be created dynamically by server (e.g. from database content). This way you could manage even larger collections of MD documents
(stored in relational or No-SQL databse or just filesystem for that matter) handily with DocIndex.

## Q: I see **undefined** as group title on the DocIndex side pane - what's going on ?
A: You probably forgot to declare a group (in docindex.json `"groups": {...}` ) or use it in doc items (e.g. `"grp": "extra",`).
The spelling in the keys of "groups" must exactly match value of "grp" in doc items (case sensitive).

## Q: I don't want to install Node.js to get DocIndex going. Is there way to work that out.

Yes, follow the "no-Node / Git Install" in the installation instructions.
