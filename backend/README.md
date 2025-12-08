docker build -t nallahealthbackend .
docker run -d -p 5001:5001 --name nallahealthbackend nallahealthbackend

docker tag nallahealthbackend kishorthopps/nallahealthbackend:latest
docker push kishorthopps/nallahealthbackend:latest
docker pull kishorthopps/nallahealthbackend:latest
docker run -d -p 5001:5001 --name nallahealthbackend kishorthopps/nallahealthbackend