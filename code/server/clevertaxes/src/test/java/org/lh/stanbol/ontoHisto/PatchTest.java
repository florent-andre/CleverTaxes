package org.lh.stanbol.ontoHisto;

import java.io.FileNotFoundException;
import java.util.Collection;

import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.serializedform.Parser;
import org.apache.clerezza.rdf.core.serializedform.Serializer;
import org.apache.clerezza.rdf.core.serializedform.UnsupportedFormatException;
import org.junit.Assert;
import org.junit.Test;

import eu.lh.clerezza.utils.ZZutils;

public class PatchTest {
	
	private TcManager tcm;
	private Parser parser;
	
	private Graph parseTestFile(String fileName) throws UnsupportedFormatException, FileNotFoundException{
		
		return parser.parse(this.getClass().getClassLoader().getResourceAsStream(fileName), "application/rdf+xml");
	}
	
	public PatchTest(){
		tcm = TcManager.getInstance();
		parser = Parser.getInstance();
	}
	
	private void getMgraph(UriRef graphName){
		//create the graph if not existing. 
		if(!tcm.listMGraphs().contains(graphName)){
			tcm.createMGraph(graphName);
		}else{
			tcm.deleteTripleCollection(graphName);
		}
	}
	
	private void applyDiff(String diffFile) throws UnsupportedFormatException, FileNotFoundException{
		Graph hg = parseTestFile(diffFile);
		Assert.assertNotNull(hg);
		Patch p = new Patch();
		p.apply(hg, tcm);
	}
	
	@Test
	public void testAddOneNewTriple() throws UnsupportedFormatException, FileNotFoundException{
		/**
		 * For printing graph
		 */
//		System.out.println("===========================");
//		Serializer ser = Serializer.getInstance();
//		ser.serialize(System.out, og, "application/rdf+xml");
//		System.out.println("===========================");
		
		UriRef graphNameOne = new UriRef("http://ontoHisto.testGraph/1"); 
		getMgraph(graphNameOne);
		
		//for now, size of the graphOne in 0
		MGraph og = tcm.getMGraph(graphNameOne);
		Assert.assertEquals(0, og.size());
		
		applyDiff("add-one-new-triple.xml");
		
		//Now the size is different than 0
		og = tcm.getMGraph(graphNameOne);
		Assert.assertNotSame(0, og.size());
		Assert.assertEquals(1, og.size());
		
		//*** Add triples
		applyDiff("add-triples.xml");
		
		//Now the size is 3 (1 from the first test and 2 with this)
		og = tcm.getMGraph(graphNameOne);
		Assert.assertEquals(4, og.size());
		
		Collection<Triple> res = ZZutils.toCollection(og.filter(new UriRef("http://www/subject/2"), null, null));
		Assert.assertEquals("This node as two children now",2, res.size());
		
		
		//*** Change order
		applyDiff("change-order-testing.xml");		
		
		//Assert.assertEquals(4, og.size());
		
		//only one triple with this subject and property, object value as to be "CHANGED"
		Collection<Triple> r = ZZutils.toCollection(og.filter(new UriRef("http://www/subject/2"), new UriRef("http://www/prop/narrower"), null)); 
		Assert.assertEquals(1, r.size());
		Resource resources = r.iterator().next().getObject();
		Assert.assertEquals("This triple object's value is equal to 'CHANGED'","CHANGED", ((Literal)resources).getLexicalForm());
		
		//*** Delete a triple
		applyDiff("delete-triple.xml");
		
		//Now the size is 3 (1 from the first test and 2 with this)
		Assert.assertEquals(3, og.size());
		
		//*** Test ALL
		applyDiff("all-keyword.xml");
		
		//graph size is still 3
		Assert.assertEquals(3, og.size());
		
		Collection<Triple> broaders = ZZutils.toCollection(og.filter(null, new UriRef("http://www/prop/broader"), null));
		Assert.assertEquals("There is no more broader predicate in the graph", 0, broaders.size());
		
		Collection<Triple> newBroaders = ZZutils.toCollection(og.filter(null, new UriRef("http://www/prop/NEWbroader"), null));
		Assert.assertEquals("All broaders are remplaced by NEWBroader", 2, newBroaders.size());
		
		//***** remove all triples
		applyDiff("remove-all-graph.xml");
		Assert.assertEquals("All triples are remove, size graph is 0.",0, og.size());	
	}
	
}
