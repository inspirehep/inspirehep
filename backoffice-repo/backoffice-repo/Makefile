# Makefile

# Set the AIRFLOW_HOME environment variable
export AIRFLOW_HOME=$(shell pwd)/workflows
export AIRFLOW_PROJ_DIR=$(AIRFLOW_HOME)

# Default target
all: run

run:
	docker-compose up

clean:
	docker-compose down

init: backoffice-init workflows-init

backoffice-init:
	docker-compose exec backoffice-webserver python manage.py create_groups
	docker-compose exec backoffice-webserver python manage.py loaddata backoffice/users/fixtures/users.json
	docker-compose exec backoffice-webserver python manage.py loaddata backoffice/users/fixtures/tokens.json
	echo "Backoffice initialized"

workflows-init:
	docker-compose exec airflow-webserver /entrypoint airflow connections import ./scripts/connections/connections.json
	docker-compose exec airflow-webserver /entrypoint airflow variables import ./scripts/variables/variables.json
	echo "\033[31mCHANGE inspire_token in Admin->Variables\033[0m"
	echo "Workflows initialized"
