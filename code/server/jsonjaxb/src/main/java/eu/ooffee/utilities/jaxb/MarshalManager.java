package eu.ooffee.utilities.jaxb;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

//import org.eclipse.persistence.jaxb.UnmarshallerProperties;
import org.eclipse.persistence.oxm.MediaType;

@SuppressWarnings("restriction")
public class MarshalManager {
	
	protected Unmarshaller unmarshaller;
	protected Marshaller marshaller;
	
	
	protected MarshalManager(JAXBContext jc, MediaType mediaType)throws JAXBException{
		unmarshaller = jc.createUnmarshaller();
        unmarshaller.setProperty("eclipselink.media-type", mediaType.getMediaType());
        //unmarshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        //unmarshaller.setProperty(UnmarshallerProperties.JSON_INCLUDE_ROOT, false);
        
        marshaller = jc.createMarshaller();
		marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
        marshaller.setProperty("eclipselink.media-type", mediaType.getMediaType());
        //marshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        //marshaller.setProperty(UnmarshallerProperties.JSON_INCLUDE_ROOT, false);
	}
	
	protected MarshalManager(JAXBContext jc) throws JAXBException{
		this(jc,MediaType.APPLICATION_JSON);
	}
	
	public Unmarshaller getUnmarshaller() {
		return unmarshaller;
	}
	
	public Marshaller getMarshaller() {
		return marshaller;
	}
	
}
