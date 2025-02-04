DOCKER_COMPOSE = docker-compose

.PHONY: dev run down start stop

dev:
	node --watch server.js

run:
	$(DOCKER_COMPOSE) start && node --watch server.js

down: 
	$(DOCKER_COMPOSE) down

start:
	$(DOCKER_COMPOSE) start

stop:
	$(DOCKER_COMPOSE) stop