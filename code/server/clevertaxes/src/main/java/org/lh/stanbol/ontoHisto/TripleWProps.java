package org.lh.stanbol.ontoHisto;

import java.util.HashMap;
import java.util.Map;

import org.apache.clerezza.rdf.core.NonLiteral;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.impl.TripleImpl;

public class TripleWProps extends TripleImpl {
	
	Map<String,Object> m;
	
	public TripleWProps(NonLiteral subject, UriRef predicate, Resource object) {
		super(subject, predicate, object);
		m = new HashMap<String, Object>();
	}
	
	public TripleWProps(Triple trp) {
		this(trp.getSubject(), trp.getPredicate(), trp.getObject());
	}

	public void setProp(String keyName, Resource object) {
		m.put(keyName, object);
	}

	public Object getProp(String keyName) {
		return m.get(keyName);
	}
	
	
}
