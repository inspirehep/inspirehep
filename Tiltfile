docker_build('inspirehep/hep', 'backend/')
docker_build('inspirehep/ui', 'ui/')

k8s_yaml(local('kustomize build ssh://git@gitlab.cern.ch:7999/inspire/kubernetes.git//inspire/overlays/local'))
k8s_resource('traefik', port_forwards=['8443:443', '8080:80', '8081:8080'])
