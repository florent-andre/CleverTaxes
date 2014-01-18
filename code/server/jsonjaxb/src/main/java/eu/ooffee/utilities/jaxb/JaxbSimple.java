package eu.ooffee.utilities.jaxb;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import org.eclipse.persistence.jaxb.UnmarshallerProperties;
import org.eclipse.persistence.jpa.osgi.PersistenceProvider;
import org.eclipse.persistence.oxm.MediaType;

public class JaxbSimple {
	
	//TODO : 
	// creation d'une map indexée sur les classloader qui contient un "container" de marshaller/unmarshaller
	// à chaque appel de serialisation, récupération du classloader de l'objet, si pas existant création d'un nouveau
	// idem pour la déserialisation, test sur la levée d'erreur ou non.
	
	private static Map<ClassLoader, MarshalContainer> bigList;
	
	private static MarshalContainer newMarshalContainer(ClassLoader cl)throws JaxbSimpleException{
		try{
			
			JAXBContext jc = JAXBContext.newInstance(ModelNS.list, cl);
			
			Unmarshaller unmarshaller = jc.createUnmarshaller();
			
			MediaType mediaType = MediaType.APPLICATION_JSON;
	        unmarshaller.setProperty("eclipselink.media-type", mediaType.getMediaType());
	        unmarshaller.setProperty(UnmarshallerProperties.JSON_INCLUDE_ROOT, false);
			
	        Marshaller marshaller = jc.createMarshaller();
	        marshaller.setProperty("eclipselink.media-type", mediaType.getMediaType());
	        marshaller.setProperty(UnmarshallerProperties.JSON_INCLUDE_ROOT, false);
	        
	        return new MarshalContainer(unmarshaller, marshaller);
		}catch(JAXBException e){
			throw new JaxbSimpleException(e);
		}
		
	}
	
	private static MarshalContainer getMarshalContainer(ClassLoader cl) throws JaxbSimpleException{
		//if map is empty, init it
		if(bigList == null) bigList = new HashMap<ClassLoader, MarshalContainer>();
		
		if(bigList.containsKey(cl)) return bigList.get(cl);
		
		//this class loader is not referenced
		bigList.put(cl, newMarshalContainer(cl));
		return getMarshalContainer(cl);
	}
	
//	public static Object deserialise(InputStream source){
//		getUnmarshaller().unmarshal(source);
//	}
	
	public static void serialise(Object obj,OutputStream out) throws JaxbSimpleException{
		try {
			getMarshalContainer(obj.getClass().getClassLoader()).getMarshaller().marshal(obj, out);
		} catch (JAXBException e) {
			throw new JaxbSimpleException(e);
		}
	}

}
