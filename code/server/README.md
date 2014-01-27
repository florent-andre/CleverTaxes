
# preliminary datamodel : 

city
	name
	hasBudgetLine

budgetLine
	name
	children
	

budgetPlan
	userName
	values


value
	budgetLine
	amount

# REST API definition

## get the demo town

curl -H "accept:application/rdf+xml" "http://localhost:8080/skosifier?name=demo"

curl -H "accept:application/json" "http://localhost:8080/skosifier?name=demo" > result.xml

curl -H "accept:application/rdf+json" "http://localhost:8080/skosifier?name=demo" > result.xml



## Create a user

The endpoint accept APPLICATION_FORM_URLENCODED stuff :
curl "http://localhost:8181/createUser?name="my name"&taxAmount=500"

