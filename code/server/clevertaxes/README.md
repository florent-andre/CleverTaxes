
# REST API definition for skosifier

## POST a file and a mapping definition for skosification 

The endpoint accept APPLICATION_FORM_URLENCODED stuff :
curl -X POST --data-urlencode conf@mapping.json --data-urlencode file@horn1.csv http://localhost:8080/skosifier

// if endpoint is transform to MULTIPART_FORM_DATA 
//curl -X POST -H "Accept: text/turtle" -F "conf=@mapConf.json" -F "file=@data.csv" http://localhost:8080/skosifier

* create an empty graph : 
curl -X POST --data-urlencode conf@mapping.json http://localhost:8080/skosifier

## Get the list of existing thesaurus

* curl -H "Accept: application/json" http://localhost:8080/skosifier/graphlist

## Get the list of all existing graph

* curl -H "Accept: application/json" http://localhost:8080/skosifier/graphlist/all

## delete a graph

curl -X DELETE http://localhost:8080/skosifier?uri="http://you.graph.uri"

## get a graph
curl -H "Accept: application/json" http://46.4.91.27:8080/skosifier/graphlist/get?id="http://your.graph.uri"

## Get a thesaurus

* for get it as turtle
* curl -H "Accept: text/turtle" http://localhost:8080/skosifier?uri=http://cuture-heritage.org/thesaurus/organisationID/nameTest2

* you can also get it as json, json-ld, rdf/xml or n3 with the use of the correct Accept header.

## get metatada of a graph

curl -H "Accept: application/rdf+xml" "http://localhost:8080/skosifier/metadata?for=http://cuture-heritage.org/thesaurus/florent/testFullCSVimport

## Get skos informations 

curl -H "Accept: application/json" http://localhost:8080/skosifier/skosdefinition?type=all|reference|properties

## Get graphLink for 2 graphs

curl -H "Accept: application/json" "http://localhost:8080/skosifier/graphlink?graphOne=http://cuture-heritage.org/thesaurus/florent/testFullCSVimport&graphTwo=http://cuture-heritage.org/thesaurus/organisationID/nameTest3"

# History and changes 

## Get an history file for a graph (create a new one if not existing) 

curl -H "Accept: application/rdf+xml" "http://localhost:8080/skosifier/history?for=http://cuture-heritage.org/thesaurus/florent/testFullCSVimport

## send changes set 

curl -X POST --data-urlencode change@delete-a-close-match-triple.xml http://localhost:8080/skosifier/changes

## Skosification mapping file definition
//TODO : review it with tests files

