package org.lh.stanbol.ontoHisto;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.NonLiteral;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.impl.TripleImpl;
import org.apache.stanbol.enhancer.servicesapi.rdf.Properties;

import eu.lh.clerezza.utils.ZZutils;
import eu.lh.utils.naming.NameGenerator;
import eu.lh.utils.ns.LHOntology;

public class Patch {
	
	public Patch(){};
	
    
    private Collection<Triple> sortChanges(Iterator<Triple> changes,Graph histoGraph){
    	final String keyName = "date";
    	ArrayList<Triple> a = new ArrayList<Triple>();
    	//for each change
    	while (changes.hasNext()){
    		TripleWProps trp = new TripleWProps(changes.next());
        	//get the date value and add it to the Triple
        	trp.setProp(keyName, histoGraph.filter((UriRef)trp.getObject(), LHOntology.date.getProperty(), null).next().getObject());
        	a.add(trp);
    	}
    	
    	//TODO : create tests for this and use real dates
    	//TODO for sort dates see the use of import org.apache.clerezza.rdf.core.impl.util.W3CDateFormat;
    	Comparator<Triple> dateCompare = new Comparator<Triple>() {
			@Override
			public int compare(Triple o1, Triple o2) {
				if(o1.getObject().equals(o2.getObject())){
					return 0;
				}
				long v1 = Long.parseLong(((Literal)((TripleWProps)o1).getProp(keyName)).getLexicalForm());
				long v2 = Long.parseLong(((Literal)((TripleWProps)o2).getProp(keyName)).getLexicalForm());
				int res = v1 - v2 > 0 ? 1 : -1;
				return res;
			}    		
		};
		Collections.sort(a, dateCompare );
		
    	return a;
    }
    
    /**
     * Save histories/diffs inside the TcManager. Don't apply them, only save.
     * @param histoGraph
     * @param tcManager
     */
    public void saveDiffs(Graph histoGraph, TcManager tcManager){
    	//TODO : create a test for this function
    	Iterator<Triple> histories = histoGraph.filter(null, Properties.RDF_TYPE, LHOntology.history.getProperty());
        while(histories.hasNext()){
        	Triple h = histories.next();
        	MGraph historyG = tcManager.getMGraph((UriRef)h.getSubject());
        	historyG.addAll(ZZutils.toCollection(histoGraph.filter(h.getSubject(), null, null)));
        	//end adding the change graph to the global history graph
        }
    }
    
    
    //TODO change to use atomDiff
    private AtomDiff getOldNewValues(UriRef changeTripleSubject, Graph histoGraph){
    	
    	AtomDiff result = new AtomDiff();
    	
    	Iterator<Triple> iterOldValues = histoGraph.filter(changeTripleSubject,LHOntology.element.getProperty(),null);
    	Iterator<Triple> iterNewValues = histoGraph.filter(changeTripleSubject,LHOntology.newValue.getProperty(),null);
    	
    	result.oldValue = iterOldValues.hasNext() ? iterOldValues.next().getObject() : null;
    	// //if no new value define, get the old one.
    	//result.newValue = iterNewValues.hasNext() ? iterNewValues.next().getObject() : result.oldValue;
    	result.newValue = iterNewValues.hasNext() ? iterNewValues.next().getObject() : null;
    	
		return result;
    }
    
    private Object computeAtomValue(AtomDiff adx, Object oldAtomValue){
    	return adx.newValue == null ? 
    			LHOntology.all.getProperty().equals(adx.oldValue) ? oldAtomValue : adx.oldValue 
						: adx.newValue;
    }
    
    private Object computeAtomValue(AtomDiff adx){
    	return adx.newValue == null ?  adx.oldValue : adx.newValue;
    }
    
    private boolean oneNewValIsDelete(AtomDiff ads, AtomDiff adp, AtomDiff ado) {
    	return (LHOntology.delete.getProperty().equals(ads.newValue))
    			||
    			(LHOntology.delete.getProperty().equals(adp.newValue))
    			||
    			(LHOntology.delete.getProperty().equals(ado.newValue));
	}
    
    private boolean oneOldValIsAll(AtomDiff ads, AtomDiff adp, AtomDiff ado) {
    	return (LHOntology.all.getProperty().equals(ads.oldValue))
    			||
    			(LHOntology.all.getProperty().equals(adp.oldValue))
    			||
    			(LHOntology.all.getProperty().equals(ado.oldValue));
	}
    
    
    /**
     * Apply the history graph to the graph stack managed by TcManager
     * @param histoGraph
     * @param tcManager
     * @return
     */
    //TODO : return an Mgraph mean nothing, as it will only return the last processed one.
    //Change the method signature. Send an error if problem during processing ?
    // replace the mgraph return by an array/list of uri of modified graph.
	public MGraph apply(Graph histoGraph, TcManager tcManager){
		MGraph gToChange = null;        
                
        //processing history file
        //get history "root"
        Iterator<Triple> histories = histoGraph.filter(null, Properties.RDF_TYPE, LHOntology.history.getProperty());
        
        while(histories.hasNext()){
        	
        	Triple h = histories.next();
        	
        	//process
        	//get the related graph, only get the first one (no mean to have many graphs here ?)
        	Triple trpForGraphToChange = histoGraph.filter(h.getSubject(),LHOntology.historyOf.getProperty(),null).next();
        	//--- get the modifiable graph
        	//get the internal uri of the graph
        	UriRef intGN = NameGenerator.getInternalUri((UriRef)trpForGraphToChange.getObject());
        	gToChange = tcManager.getMGraph(intGN);
        	//get the list of changes
        	Iterator<Triple> changes = histoGraph.filter(h.getSubject(), LHOntology.change.getProperty(),null);
        	//change list is sorted by date ascending
        	Collection<Triple> sc = sortChanges(changes,histoGraph);
        	Iterator<Triple> isc = sc.iterator();
        	while(isc.hasNext()){
        		//Add and remove need to be done after each h:change
        		List<Triple> rmTripleList = new ArrayList<Triple>();
    			List<Triple> addTripleList = new ArrayList<Triple>();
    			
        		Triple c = isc.next();
        		UriRef changeRef = (UriRef)c.getObject();
        		
        		//get changed subjects
        		Iterator<Triple> changedSubjects = histoGraph.filter(changeRef,LHOntology.subject.getProperty(),null);
        		//get the change node
        		while(changedSubjects.hasNext()){
        			
        			UriRef subjectToChange = (UriRef)changedSubjects.next().getObject();
        			AtomDiff subjectOldNew = getOldNewValues(subjectToChange, histoGraph);
        			
        			Iterator<Triple> changedProps = histoGraph.filter(subjectToChange,LHOntology.property.getProperty(),null);
        			
        			while(changedProps.hasNext()){
        				UriRef propToChange = (UriRef)changedProps.next().getObject();
        				AtomDiff propOldNew = getOldNewValues(propToChange, histoGraph);
        				
        				Iterator<Triple> changedObjects = histoGraph.filter(propToChange,LHOntology.object.getProperty(),null);
        				
        				while(changedObjects.hasNext()){
        					UriRef objectToChange = (UriRef)changedObjects.next().getObject();
        					AtomDiff objectOldNew = getOldNewValues(objectToChange, histoGraph);
        					
        					
    						if(oneOldValIsAll(subjectOldNew,propOldNew,objectOldNew)){
    							//filter atoms for remove
            					NonLiteral sf = LHOntology.all.getProperty().equals(subjectOldNew.oldValue) ? null : (NonLiteral)subjectOldNew.oldValue;
            					UriRef pf = LHOntology.all.getProperty().equals(propOldNew.oldValue) ? null : (UriRef)propOldNew.oldValue;
            					Resource of = LHOntology.all.getProperty().equals(objectOldNew.oldValue) ? null : (Resource)objectOldNew.oldValue;
            					
            					//directly transform to collection in order to iterate on filter result and be able to add this results to rmTripleList
            					Collection<Triple> allTrpToRm = ZZutils.toCollection(gToChange.filter(sf, pf, of));
            					Iterator<Triple> allTrpToRemoveIter = allTrpToRm.iterator();
            					
            					//if there is NO delete we need to create new triples
    							if(!oneNewValIsDelete(subjectOldNew,propOldNew,objectOldNew)){	
                					while(allTrpToRemoveIter.hasNext()){
            							Triple oldTrp = allTrpToRemoveIter.next();
            							NonLiteral ns = (NonLiteral)computeAtomValue(subjectOldNew, oldTrp.getSubject());
            							UriRef np = (UriRef)computeAtomValue(propOldNew, oldTrp.getPredicate());
            							Resource no = (Resource)computeAtomValue(objectOldNew, oldTrp.getObject());
            							addTripleList.add(new TripleImpl(ns, np, no));
            						}
    							}
    							rmTripleList.addAll(allTrpToRm);
    						}
    						//No all value
    						else{
            					//if there is NO delete we need to create new triples
    							if(!oneNewValIsDelete(subjectOldNew,propOldNew,objectOldNew)){
                					//create the new triple
        							NonLiteral ns = (NonLiteral)computeAtomValue(subjectOldNew);
        							UriRef np = (UriRef)computeAtomValue(propOldNew);
        							Resource no = (Resource)computeAtomValue(objectOldNew);
        							addTripleList.add(new TripleImpl(ns, np, no));
    							}
    							//Remove the triple
    							//test if there is no null value in old atom in order to create the old triple to remove
            					if (subjectOldNew.oldValue != null && propOldNew.oldValue != null && objectOldNew.oldValue != null){
            						//TODO : test if one property has the all ns/keyword : then add to rmtriple list all thinks that answer to a filter with a null
            						rmTripleList.add(new TripleImpl((NonLiteral)subjectOldNew.oldValue, (UriRef)propOldNew.oldValue, (Resource)objectOldNew.oldValue));
            					}
    						}
        				}
        			}
        		}
        		gToChange.removeAll(rmTripleList);
        		gToChange.addAll(addTripleList);
        	}
        }
        return gToChange;
	}

	
	
}
