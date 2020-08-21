# FIXME: we could make them as different CI steps, instead of a big script step so that restart is faster
rc=0
# TODO: rename `smoke-tests`
files="-f docker-compose.yml -f ./smoke-tests/docker-compose.cypress.yml"
docker-compose $files build --parallel
docker-compose $files up -d
docker-compose $files exec web ./scripts/setup

# author and all literature records are needed for author detail (publications & cited by), author update submission, literature search, literature detail
# experiment (some of the literature), job, conference (some of the literature), seminar records are needed for the detail pages repectively and some for update submissions
docker-compose $files exec web inspirehep importer records -f data/records/seminars/1799778.json -f data/records/conferences/1217045.json -f data/records/jobs/1812440.json -f data/records/authors/1274753.json -f data/records/institutions/902858.json -f data/records/experiments/1513946.json -f data/records/literature/1331798.json -f data/records/literature/1325985.json -f data/records/literature/1306493.json -f data/records/literature/1264675.json -f data/records/literature/1263659.json -f data/records/literature/1263207.json -f data/records/literature/1249881.json -f data/records/literature/1235543.json -f data/records/literature/1198168.json -f data/records/literature/1113908.json -f data/records/literature/873915.json -f data/records/literature/1688995.json -f data/records/literature/1290484.json -f data/records/literature/1264013.json -f data/records/literature/1257993.json -f data/records/literature/1310649.json -f data/records/literature/1473056.json -f data/records/literature/1358394.json -f data/records/literature/1374620.json -f data/records/literature/1452707.json -f data/records/literature/1649231.json -f data/records/literature/1297062.json -f data/records/literature/1313615.json -f data/records/literature/1597429.json -f data/records/literature/1184194.json -f data/records/literature/1322719.json -f data/records/literature/1515024.json -f data/records/literature/1510263.json -f data/records/literature/1415120.json -f data/records/literature/1400808.json -f data/records/literature/1420712.json -f data/records/literature/1492108.json -f data/records/literature/1598135.json -f data/records/literature/1306493.json -f data/records/literature/1383683.json -f data/records/literature/1238110.json

# literature-conference relation
docker-compose $files exec web inspirehep importer records -f data/records/literature/1787272.json -f data/records/conferences/1787117.json

#author search
docker-compose $files exec web inspirehep importer records -f data/records/authors/1004662.json -f data/records/authors/1060898.json -f data/records/authors/1013725.json -f data/records/authors/1078577.json -f data/records/authors/1064002.json -f data/records/authors/1306569.json --save

#job search
docker-compose $files exec web inspirehep importer records -f data/records/jobs/1811684.json -f data/records/jobs/1812904.json -f data/records/jobs/1813119.json -f data/records/jobs/1811836.json -f data/records/jobs/1812529.json

#seminar search
docker-compose $files exec web inspirehep importer records -f data/records/seminars/1811573.json -f data/records/seminars/1811750.json -f data/records/seminars/1811657.json -f data/records/seminars/1807692.json -f data/records/seminars/1807690.json

#conference search
docker-compose $files exec web inspirehep importer records -f data/records/conferences/1769332.json -f data/records/conferences/1794610.json -f data/records/conferences/1809034.json -f data/records/conferences/1776122.json -f data/records/conferences/1622944.json

dockef wait inspirehep_ui-build_1 

docker-compose $files run -w "/tests" --rm cypress bash -c "yarn && yarn test --browser chrome --headless --env inspirehep_url=http://ui:8080" || rc=$?
exit $rc
