# Attraction-Scanner
A full stack, server render, location based web application allows user to get surrounding attractions. The default radius is 500m but it can be adjusted between 100-1000m. User will be to save places to there favourite list and pin it on the map. The application also supports displaying country border within the dropdown list.
To run this application 
Clone the code 
build docker image which will be used to create django container mentioned below

Containers
Working with domain name and certbot to create a secure web aka HTTPS 
check https://certbot.eff.org/hosting_providers for providers that support certbot in this case I used wordpress
navigate to domain page in wordpress
find dns record and add a record type A anysubdomain.domainname.something and ip address of cloud host virtual machine
get certificate using docker 
create a custom docker file of Nginx/certbot
FROM nginx
MAINTAINER <Your Name Surname>
RUN apt-get -y update && apt-get -y upgrade && apt-get -y install software-properties-
common certbot python3-certbot-nginx

build image
Dockerfile
FROM nginx
MAINTAINER <Your Name Surname>
RUN apt-get -y update && apt-get -y upgrade && apt-get -y install software-properties-
common certbot python3-certbot-nginx

create a container 
docker create --name wmap_nginx_certbot --network wmap_network --network-alias
wmap-nginx-certbot -p 80:80 -p 443:443 -t -v wmap_web_data:/usr/share/nginx/html -v
$HOME/wmap_nginx_certbot/conf:/etc/nginx/conf.d -v /etc/letsencrypt:/etc/letsencrypt -v
/var/www/certbot -v html_data:/usr/share/nginx/html/static wmap_nginx_certbot

docker exec -it wmap_nginx_certbot /bin/bash
certbot certonly --nginx 
when asked for domain name use the record type A full domain name created above

PgAdmin4 
docker create --name wmap_pgadmin4 --network wmap_network --network-alias wmap-pgadmin4 -t wmap_pgadmin_data:/var/lib/pgadmin -e 'PGADMIN_DEFAULT_EMAIL=<your.tud.account>@tudublin.ie' -e 'PGADMIN_DEFAULT_PASSWORD=mypassword' dpage/pgadmin4

Postgis 
docker create --name wmap_postgis --network wmap_network --network-alias wmap-postgis -t -v wmap_postgis_data:/var/lib/postgresql -e 'POSTGRES_USER=docker' -e 'POSTGRES_PASS=docker' kartoza/postgis

Django build using image created from dockerfile included in project
docker create --name your_app_name --network wmap_network --network-alias your-network-alias -t -v html_data:/usr/src/app/static your_image_name 
