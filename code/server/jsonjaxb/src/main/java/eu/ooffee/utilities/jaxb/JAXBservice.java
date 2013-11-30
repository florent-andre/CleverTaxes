package eu.ooffee.utilities.jaxb;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.eclipse.persistence.oxm.MediaType;

/**
 * main static class to use
 * you need a jaxb.index for this working
 * TODO : document this better
 * @author florent
 *
 */
public class JAXBservice extends MarshalManager{
	
	
	/**
	 * Do not use this constructor, use the static function instead.
	 * @param jc
	 * @throws JAXBException
	 */
	protected JAXBservice(JAXBContext jc) throws JAXBException {
		super(jc);
	}

	/**
	 * ContextPath is a colon (":") separated list of fully qualified packages names
	 * @param contextPath
	 * @param cl
	 * @throws JAXBException
	 */
	public static MarshalManager getMarshallerManager (String contextPath, ClassLoader cl) throws JAXBException{
		
		JAXBContext jc = JAXBContext.newInstance(contextPath,cl);
    	
    	return new MarshalManager(jc);
	}
	
	public static MarshalManager getMarshallerManager (String contextPath, ClassLoader cl, MediaType mediaType) throws JAXBException{
		
		JAXBContext jc = JAXBContext.newInstance(contextPath,cl);
    	
    	return new MarshalManager(jc,mediaType);
	}
}
