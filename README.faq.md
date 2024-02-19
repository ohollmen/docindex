# DocIndex FAQ - Frequently Asked Questions

## Q: Where are the HTML converted from HTML files (on the filesystem) ?

A: They are nowhere on the Filesystem. Docindex was created to avoid this "convert Markown files to static HTML files" process.
Docindex downloads the Markdown files from server and converts them to HTML **in the browser**. This way you continue to author
and modify you Markdown files on sever (never needing to convert them manually) and view them in DocIndex (Sidenote: DocIndex
allows you also to view HTML files, see FAQ item below).

## Q: I have some "legacy" HTML documentation files around - can I view them via DocIndex ?
Yes you can. Just enter them info `docindex.json` document nodes using their original filename (e.g. "install.html") -
DocIndex will detect the file suffix and (**not** convert) use them as-is for viewing. However it is preferred that
these documentation files are **not a complete** HTML page with `<HTML>`, '<HEAD>` and `<BODY>` tags in them - but just a
fragment of HTML (inner "content" part of page). If HTML is a *complete page* the viewing experience will be "undefined behaviour".

## Q: Is there a script that generates the docindex.json or do I have to create it myself ?
A: For now you have to create it by yourself. On the outher hand the docindex.json content downloaded from server could
be created dynamically by server (e.g. from database content). This way you could manage even larger collections of MD documents
(stored in relational or No-SQL databse or just filesystem for that matter) handily with DocIndex.

