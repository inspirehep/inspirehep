  CHANGED_PROJECTS=`git diff --name-only $TRAVIS_COMMIT_RANGE | awk -F'/' 'NF!=1{print $1}' | sort -u`
  for project in $CHANGED_PROJECTS;
  do
      if [ "$project" == "$1" ]; then
          echo CHANGED;
          break;
      fi
  done
