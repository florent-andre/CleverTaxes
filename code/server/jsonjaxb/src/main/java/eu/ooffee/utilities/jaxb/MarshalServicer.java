package eu.ooffee.utilities.jaxb;

import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.PropertyException;
import javax.xml.bind.Unmarshaller;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.persistence.jaxb.UnmarshallerProperties;


public class MarshalServicer {
	
	protected static Log log = LogFactory.getLog(MarshalServicer.class);
	
	protected static MarshalManager marshalManager = null;
	protected static Marshaller marshaller = null;
	protected static Unmarshaller unmarshaller = null;
	
	public static Marshaller getMarshaller() {
		MarshalManager mm = getMarshalManager();
		if(marshaller == null){
			marshaller = mm.getMarshaller();
			try {
				marshaller.setProperty(UnmarshallerProperties.JSON_INCLUDE_ROOT, false);
			} catch (PropertyException e) {
				log.error(e);
			}
		}
		return marshaller;
	}
	
	public static Unmarshaller getUnmarshaller(){
		MarshalManager mm = getMarshalManager();
		if(unmarshaller == null){
			unmarshaller = mm.getUnmarshaller();
			try {
				unmarshaller.setProperty(UnmarshallerProperties.JSON_INCLUDE_ROOT, false);
			} catch (PropertyException e) {
				log.error(e);
			} 
		}
		return unmarshaller;
	}
	
	private static MarshalManager getMarshalManager() {
		if(marshalManager == null){
			try {
				marshalManager = JAXBservice.getMarshallerManager(ModelNS.list, MarshalServicer.class.getClassLoader());
			} catch (JAXBException e) {
				log.error(e);
			} 
		}
		return marshalManager;
	}

}