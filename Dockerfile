FROM centos:7

MAINTAINER Paul Visco <paul.visco@roswellpark.org>

#set the timezone
RUN rm /etc/localtime
RUN ln -s /usr/share/zoneinfo/US/Eastern /etc/localtime

# Install app dependencies

RUN yum install -y curl

RUN curl wget http://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm > epel-release-latest-7.noarch.rpm
RUN rpm -ivh epel-release-latest-7.noarch.rpm
RUN yum install -y --enablerepo=epel nodejs libreoffice bzip2
RUN yum install -y libreoffice -y
RUN yum update -y

#create the source directory
RUN mkdir -p /usr/src/
WORKDIR /usr/src/app

# Bundle app source
COPY src/home.html /usr/src/app
COPY src/package.json /usr/src/app
RUN npm install

COPY src/server.js /usr/src/app

CMD [ "npm", "start" ]
