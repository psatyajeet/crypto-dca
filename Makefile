APPLICATION_NAME ?= crypto-dca

build:
		docker build --tag ${APPLICATION_NAME} .

run_local:
		docker run --rm -p 8080:8080 ${APPLICATION_NAME}

tag:
		docker tag ${APPLICATION_NAME} ${DOCKER_REGISTRY}/${APPLICATION_NAME}:latest

push:
		docker push ${DOCKER_REGISTRY}/${APPLICATION_NAME}:latest

docker_build_and_push: build tag push
