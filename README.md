# INSPIRE Backoffice

This repo consists of Airflow Dags and Django backoffice. To run it:

```bash
make run
make init
```


# Deploying to QA

Current development process requires:
## Deploy to backoffice:
 - Go to Harbor: https://registry.cern.ch/harbor/projects/2086/repositories/inspire%2Fbackoffice/artifacts-tab
 - Copy the tag of the lastest image into https://github.com/cern-sis/kubernetes-inspire/blob/main/backoffice/environments/backoffice/kustomization.yml#L66
 - Go to https://argocd.sis-inspire-20240708.siscern.org/applications/argocd/inspire-backoffice and synchronize
## Deploy to airflow:
 - Go to Harbor: https://registry.cern.ch/harbor/projects/2086/repositories/inspire%2Fworkflows/artifacts-tab
 - Copy the tag of the lastest image into [https://github.com/cern-sis/kubernetes-inspire/blob/main/backoffice/environments/backoffice/kustomization.yml#L66](https://github.com/cern-sis/kubernetes-airflow/blob/main/airflow/environments/airflow-inspire-dev/kustomization.yml#L19)
 - Go to https://argocd-airflow.siscern.org/applications/argocd/airflow-inspire-dev and synchronize
