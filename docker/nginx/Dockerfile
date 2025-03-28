# Utilisation d'une image Nginx avec ModSecurity pré-installé
FROM owasp/modsecurity-crs:nginx

# Activer ModSecurity dans la configuration Nginx
RUN echo "load_module modules/ngx_http_modsecurity_module.so;" > /etc/nginx/nginx.conf

# Copier les fichiers de configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/modsecurity.conf /etc/nginx/modsecurity.conf
COPY docker/nginx/owasp-crs/ /etc/nginx/owasp-crs/

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/certs /etc/nginx/certs
COPY docker/nginx/owasp-crs /etc/nginx/owasp-crs

# Définir l'entrée du conteneur
ENTRYPOINT ["nginx", "-g", "daemon off;"]