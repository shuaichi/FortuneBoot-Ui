FROM nginx:1.26.0-alpine

ENV LANG C.UTF-8
ENV TZ=Asia/Shanghai
#COPY ./docker/ssl/ /etc/ssl/
COPY ./docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY ./docker/gzip.conf /etc/nginx/conf.d/gzip.conf
COPY ./dist1/ /usr/share/nginx/html
