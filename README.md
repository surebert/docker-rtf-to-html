webteam/docker-rtf-to-html
========================

This image is an http service used to convert rtf to html using libre office

# Build and Deploy

If you wanted to build and test this yourself

```bash
docker build --rm -t yournamespace/docker-rtf-to-html .

docker run -d \
    --name rtf-to-html \
    --restart=always \
    -p 127.0.0.1:9022:9022 \
    -e "port=9022" \
    yournamespace/rtf-to-html
```

# Connecting to the container from the host

```
docker exec -it rtf-to-html /bin/bash -c "export TERM=xterm; exec bash"
```

# Checking Logs from the host

```
docker logs -f rtf-to-html
```

# Installing additional commands to debug with yum
If you wanted to install nano or telnet from there for debugging
```
yum install telnet
yum install nano
```

# Using The RTF to HTML Service
To convert RTF to HTML you simply pass mutlipart encoded form data to the service.


## Example call from CURL in Bash
This assumes that the docker image was deployed to localhost on port 9021 and that you are in the test directory of this project where there are two files: one named watermark.pdf and another named my.pdf.

```bash
curl -F "rtf=@sample.rtf" http://localhost:9022/convert > sample.html

```

## Example call from CURL in PHP
You could use any language that supports http request. This assumes that the docker image was deployed to localhost on port 9022 and that you are in the test directory of this project where there are two files: one named logo.png and another named styles.css. You can simply run the example.php file in the test directory of this project or use the code below.

```php
<?php
  $ch = curl_init("http://localhost:9022/convert");
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, [
      'rtf' =>  new \CurlFile(__DIR__.'/sample.rtf','text/rtf','sample.rtf')
  ]);
  $result = curl_exec($ch);
  file_put_contents("output.html", $result);
```

# Deployment using copy of project on repos registry where the image is pre-built e.g.

```bash
docker login repos.roswellpark.org:4567
docker pull repos.roswellpark.org:4567/web-team/docker-rtf-to-html

docker run -d \
    --name rtf-to-html \
    --restart=always \
    -p 127.0.0.1:9022:9022 \
    -e "port=9022" \
    repos.roswellpark.org:4567/web-team/docker-rtf-to-html
```
