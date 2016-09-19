// @if SSL='true'
files:
  "/tmp/45_nginx_https_rw.sh":
    owner: root
    group: root
    mode: "000644"
    content: |
      #! /bin/bash

      CONFIGURED=`grep -c "return 301 https" /etc/nginx/conf.d/00_elastic_beanstalk_proxy.conf`

      if [ $CONFIGURED = 0 ]
        then
          sed -i '/listen 8080;/a \    if ($http_x_forwarded_proto = "http") { return 301 https://$host$request_uri; } \n' /etc/nginx/conf.d/00_elastic_beanstalk_proxy.conf
          logger -t nginx_rw "https rewrite rules added"
          exit 0
        else
          logger -t nginx_rw "https rewrite rules already set"
          exit 0
      fi
// @endif