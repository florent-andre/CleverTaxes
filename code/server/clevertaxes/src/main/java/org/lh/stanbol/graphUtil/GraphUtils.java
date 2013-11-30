package org.lh.stanbol.graphUtil;

import java.util.Iterator;

import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.impl.TripleImpl;

public class GraphUtils {

	public static void copyGraph(MGraph graphSource, String uriSource, MGraph graphTarget, String uriTarget){
		
		Iterator<Triple> iter = graphSource.filter(null, null, null);
    	Triple newTun;
    	while (iter.hasNext()){
    		
    		Triple tun = iter.next();
    		String s_subject = ((UriRef)tun.getSubject()).getUnicodeString().replace(uriSource, uriTarget);
    		UriRef u_subject = new UriRef(s_subject);
    		
    		if(tun.getObject() instanceof UriRef)
    		{
    			String r_objet = ((UriRef)tun.getObject()).getUnicodeString().replace(uriSource, uriTarget);
    			UriRef u_objet = new UriRef(r_objet); 			
    			newTun = new TripleImpl(u_subject,tun.getPredicate(),u_objet);
    		}
    		else{
    			newTun = new TripleImpl(u_subject,tun.getPredicate(),tun.getObject());
    		}
    		
    		graphTarget.add(newTun);
    		
    	}
	}
	
	
	
}
