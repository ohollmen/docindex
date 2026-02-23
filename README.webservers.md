# Configuring DocIndex under "Real" webservers

Setting up a "demo docindex" under a small python webserver was intended to give you a quick idea of how docindex works and how it is setup.
If you are targeting a more official docindex area (e.g. team context), it may be a better choice to have it be delivered by one of the
mainstream webservers like Apache or NginX. Note: Web server will still be delivering static content (with no special server-side applications running
under web server).

## Setting DocIndex up under Apache

It is easiest to create a new VirtualHost (e.g. in Debian/Ubuntu based distros, see 000-default.conf for examples,
save following as e.g. /etc/apache2/sites-available/markdown.conf, enable by `a2ensite`):

```
Listen 8088
<VirtualHost *:8088>
  # Test with local "/etc/hosts" file test line (host has host alias "markdown",
  # proper setup would involve a LAN or WAN level DNS addition):
  # 127.0.0.1   localhost markdown
  # Use URL: http://markdown/
  ServerName markdown
  ServerAdmin docadmin@mycomp.com
  DocumentRoot /home/mrsmith/docindex
  # Make URL reference /link to directory pick up docindex.html automatically
  DirectoryIndex docindex.html index.html
  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined
  # Use SSL* directives to enable proper HTTPS
  #SSLEngine on
  # ...
  # Directory-section is not mandatory w. VirtualHost, use as-needed
  #<Directory /home/mrsmith/docindex>
  # Options Indexes FollowSymLinks
  # AllowOverride All
  # # None
  # Require all granted
  #</Directory>
</VirtualHost>
```
# Setting DocIndex up under NginX

Create a new "server" block in NginX config. In debian configs are laid out in "sites-available" and "sites-enabled" directories.
Try saving following as "markdown" in "/etc/nginx/sites-available" (and symlink to the file from sibling directory "sites-enabled"):

```
# Define a new Nginx virtualhost ("server")
server {
  listen 8088;
  root /home/mrsmith/docindex;
  index docindex.html index.html;
  server_name markdown;
  location / {
    try_files $uri $uri/ =404;
  }
}
```
