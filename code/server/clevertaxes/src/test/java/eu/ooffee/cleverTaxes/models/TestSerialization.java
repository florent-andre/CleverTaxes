package eu.ooffee.cleverTaxes.models;

import java.io.InputStream;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.JAXBException;
import javax.xml.transform.stream.StreamSource;

import static org.junit.Assert.*;
import org.junit.Test;

import eu.ooffee.cleverTaxes.model.BudgetLines;
import eu.ooffee.cleverTaxes.model.User;
import eu.ooffee.utilities.jaxb.MarshalManager;
import eu.ooffee.utilities.jaxb.MarshalServicer;

public class TestSerialization {
	
	@Test
	public void testUserSerialization() throws JAXBException{
		User user = new User("TEST", 123.5);		
		MarshalServicer.getMarshaller().marshal(user, System.out);

	}
	
	@Test
	public void testBudgetLineDeserialization() throws JAXBException{
		
		InputStream file = getClass().getResourceAsStream("/budget_lines.json");
		StreamSource ss = new StreamSource(file);
		
		JAXBElement<BudgetLines> je = MarshalServicer.getUnmarshaller().unmarshal(ss,BudgetLines.class);
		
		BudgetLines lines = je.getValue();
		
		
		assertNotNull(lines);
		
		assertEquals(32, lines.getLines().size());
		
	}

}
