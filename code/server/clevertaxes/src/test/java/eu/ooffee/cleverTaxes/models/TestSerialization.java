package eu.ooffee.cleverTaxes.models;

import javax.xml.bind.JAXBException;

import org.junit.Test;

import eu.ooffee.cleverTaxes.model.User;
import eu.ooffee.utilities.jaxb.MarshalManager;
import eu.ooffee.utilities.jaxb.MarshalServicer;

public class TestSerialization {
	
	@Test
	public void testUserSerialization() throws JAXBException{
		
		User user = new User("TEST", 123.5);
		
		MarshalServicer.getMarshaller().marshal(user, System.out);
		
		
	}

}
