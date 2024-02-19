# Changes to docindex

## 0.0.5
- Add a little border-radius to `#sidebar` boxes in CSS
- Misc documentation (comment) changes in code.
- Add "internal document id" (simple `1..` incrementing integer id) and associated mechanism to:
  - Have element (passed with event) contain document identity (in data attribute `data-did`)
  - have it easier to build a (future) doc editor (even then this would never be default).
- Change URL link auto-conversion RegExp slightly to avoid redundantly re-converting existing URL:s within HTML (`<A HREF="..."`,
  this was a major misbehavior).
- Support `defdoc` (default document) property in docindex.json (as either sting - doc name - or integer - numeric index of doc within array - value)
- Converge to GitHub MD in preformatted/code areas/sections (3 backtics as opposed to indent).

## 0.0.6

- Started maintaining CHANGES in this file
- Implemented a built-in native JS AJAX docindex/doc (HTTP(S)) fetching to allow being independent of JQuery, axios
  - Provide example of using built-in fetching (to load docindex.json).
  - See (function) docIndex.htget
- Fix the "missing space" problem on "post" and "auto" linkproc link processing
  (This cause text before URL link and the link to be blended into single stream of characters with no space in between.
- Move/merge lengthy (duplicate) document text from the beginning of docindex.js to single master place - README.md
- Create FAQ (Inspired by a GitHub user, who created a Issue, which I noticed way too late)
- Fix a case where original (default) literal DOM element id was used in code instead of the "configured value"
  (e.g. 'doccontent' vs. using config variable cfg.docareaid)
- Reverse engineer changes between versions 0.0.4 and 0.0.5 (by donwloding versions with NPM and doing `diff -r ...`) to have a bit more
  subject matter for changes.

