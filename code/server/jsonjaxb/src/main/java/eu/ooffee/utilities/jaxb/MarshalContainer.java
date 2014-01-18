package eu.ooffee.utilities.jaxb;

import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

public class MarshalContainer {
	
	private Unmarshaller unmarshaller;
	private Marshaller marshaller;
	
	public MarshalContainer(Unmarshaller unmarshaller, Marshaller marshaller) {
		super();
		this.unmarshaller = unmarshaller;
		this.marshaller = marshaller;
	}
	public Unmarshaller getUnmarshaller() {
		return unmarshaller;
	}
	public void setUnmarshaller(Unmarshaller unmarshaller) {
		this.unmarshaller = unmarshaller;
	}
	public Marshaller getMarshaller() {
		return marshaller;
	}
	public void setMarshaller(Marshaller marshaller) {
		this.marshaller = marshaller;
	}
	
	

}
