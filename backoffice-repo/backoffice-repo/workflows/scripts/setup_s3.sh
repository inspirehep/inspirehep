sleep 10
/usr/bin/mc alias set airflow http://s3:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
/usr/bin/mc mb airflow/inspire-incoming
/usr/bin/mc mirror /opt/airflow/data airflow/inspire-incoming
exit 0
