sleep:
	sleep 5

run: start sleep setup

start:
	echo -e "\033[0;32m Starting Inspire. \033[0m"
	docker compose up -d
	echo -e "\033[0;32m Inspire Started. \033[0m"

stop:
	docker compose down
	echo -e "\033[0;32m Inspire Stopped. \033[0m"

ui:
	docker compose up -d ui

setup: hep-setup sleep load-records

hep-setup:
	echo -e "\033[0;32m Starting setup Inspire. \033[0m"
	docker compose -f docker-compose.yml exec hep-web ./scripts/setup
	echo -e "\033[0;32m Finished setup Inspire. \033[0m"

load-records:
	echo -e "\033[0;32m Loading records. \033[0m"
	docker compose exec hep-web inspirehep importer demo-records

services:
	docker compose up -d cache db mq s3 es
