package org.lh.stanbol.enhancer.jersey.resource;

import org.apache.clerezza.rdf.core.UriRef;

public enum Onthology {
	
	cityType("city")
	//use skos prefLabel and altLabel for the cityName
	,cityId("cityId")
	,hasBudgetLine("hasBudgetLine")
	
	,budgetLineType("budgetLine")
	//use skos prefLabel and AltLabel for the budgetLine Name
	//use skos definition for the description
	//use hasBudgetLine for children budget lines
	
	,budgetPlanType("budgetPlan")
	,fromUser("fromUser")
	,hasBudgetPlanValue("hasBudgetPlanValue")
	
	,budgetPlanValueType("budgetPlanValue")
	,forBudgetLine("forBudgetLine")
	,percentage("percentage")

	;
	
	
	private UriRef uri;
	
	private Onthology(String part){
		this.uri = new UriRef(getRootOntology().concat(part));
	}
	
	public UriRef getUri() {return this.uri;}
	
	public static String getRootOntology() { return "http://rdf.ooffee.eu/ontology/clevertaxes/v0.1#";}
}
