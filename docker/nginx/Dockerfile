FROM owasp/modsecurity-crs:nginx


# RUN apk add --no-cache \
#     git \
#     libtool \
#     autoconf \
#     automake \
#     g++ \
#     make \
#     curl \
#     pcre-dev \
#     zlib-dev \
#     linux-headers \
#     libxml2-dev \
#     yajl-dev \
#     lmdb-dev \
#     libtool \
#     apache2-dev \
#     openssl-dev \
#     geoip-dev

# WORKDIR /usr/src
# RUN git clone --depth 1 -b v3.0.9 https://github.com/SpiderLabs/ModSecurity.git && \
#     cd ModSecurity && \
#     git submodule init && git submodule update && \
#     ./build.sh && ./configure && make -j$(nproc) && make install

# RUN git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git

COPY docker/nginx/modsec/modsecurity.conf /etc/nginx/modsec/modsecurity.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
