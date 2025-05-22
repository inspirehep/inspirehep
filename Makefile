# Set the AIRFLOW_HOME environment variable
export AIRFLOW_HOME=$(shell pwd)/workflows
export AIRFLOW_PROJ_DIR=$(AIRFLOW_HOME)

sleep:
	sleep 10

run: services start-inspirehep start-backoffice sleep setup-inspirehep sleep setup-backoffice
run-inspirehep: services start-inspirehep sleep setup-inspirehep
run-backoffice: services start-backoffice sleep setup-backoffice
run-e2e-test: start-cypress

start: services start-inspirehep start-backoffice

start-inspirehep:
	echo -e "\033[0;32m Starting HEP. \033[0m"
	docker compose up -d hep-worker hep-web record-editor hep-ui ui
	echo -e "\033[0;32m HEP Started. \033[0m"

start-backoffice:
	echo -e "\033[0;32m Starting Backoffice. \033[0m"	
	docker compose up -d airflow-init airflow-worker airflow-webserver airflow-triggerer airflow-scheduler backoffice-webserver
	echo -e "\033[0;32m Backoffice Started. \033[0m"

start-cypress:
	docker compose up -d --force-recreate cache db mq s3 es
	docker compose up -d --force-recreate hep-worker hep-web record-editor hep-ui ui
	sleep 5
	docker compose exec hep-web ./scripts/setup
	docker compose exec hep-web inspirehep importer demo-records
	sleep 5
	bash -c "docker compose run --rm cypress cypress run --browser firefox --headless --env inspirehep_url=http://host.docker.internal:8080 | tee >(sed 's/\x1b\[[0-9;]*m//g' > cypress.log)"
	echo -e "\033[0;32m Cypress tests finished. \033[0m"

setup-backoffice: django-setup airflow-setup

django-setup:
	docker compose exec backoffice-webserver python manage.py create_groups
	docker compose exec backoffice-webserver python manage.py loaddata backoffice/users/fixtures/users.json
	docker compose exec backoffice-webserver python manage.py loaddata backoffice/users/fixtures/tokens.json
	docker compose exec backoffice-webserver python manage.py loaddata backoffice/authors/fixtures/workflows.json
	echo "\033[1;32memail: admin@admin.com / password: admin \033[0m"
	echo "Backoffice initialized"

airflow-setup:
	docker compose exec airflow-webserver /entrypoint airflow connections import ./scripts/connections/connections.json
	docker compose exec airflow-webserver /entrypoint airflow variables import ./scripts/variables/variables.json
	echo "\033[31mCHANGE inspire_token in Admin->Variables\033[0m"
	echo "\033[1;32musername: airflow / password: airflow \033[0m"
	echo "Workflows initialized"


stop:
	docker compose down
	echo -e "\033[0;32m Inspire Stopped. \033[0m"

ui:
	docker compose up -d ui

setup-inspirehep: hep-setup sleep load-records

hep-setup:
	echo -e "\033[0;32m Starting setup Inspire. \033[0m"
	docker compose -f docker-compose.yml exec hep-web ./scripts/setup
	echo -e "\033[0;32m Finished setup Inspire. \033[0m"

load-records:
	echo -e "\033[0;32m Loading records. \033[0m"
	docker compose exec hep-web inspirehep importer demo-records

services:
	docker compose up -d cache db mq s3 es
