package org.lh.stanbol.enhancer.jersey.resource;

import java.util.UUID;

import org.apache.clerezza.rdf.core.UriRef;

public class Entities {
	
	public static String getRootEntity(){ return "http://rdf.ooffee.eu/entities/clevertaxes";};
	
	public static UriRef generateNewEntity(){
		return generateNewEntity("");
	}
	
	public static UriRef generateNewEntity(String prefix){
		return new UriRef(getRootEntity() + "/" + prefix + UUID.randomUUID().toString());
	}

}
