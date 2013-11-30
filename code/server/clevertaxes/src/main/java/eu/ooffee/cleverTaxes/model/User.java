package eu.ooffee.cleverTaxes.model;

import java.util.UUID;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlID;
import javax.xml.bind.annotation.XmlIDREF;

public class User {

	@XmlID
	@XmlElement
	private String id;
	
	@XmlElement
	private double taxAmout;
	
	@XmlElement
	private String name;

	@XmlIDREF
	@XmlElement
	private TaxVentillation stateTaxVentillation;
	
	@XmlIDREF
	@XmlElement
	private TaxVentillation personnalTaxVentillation;

	public User(String name, double d){
		this.name = name;
		this.id = UUID.randomUUID().toString();
		this.taxAmout = d;
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public double getTaxAmout() {
		return taxAmout;
	}

	public void setTaxAmout(int taxAmout) {
		this.taxAmout = taxAmout;
	}

	public TaxVentillation getStateTaxVentillation() {
		return stateTaxVentillation;
	}

	public void setStateTaxVentillation(TaxVentillation stateTaxVentillation) {
		this.stateTaxVentillation = stateTaxVentillation;
	}

	public TaxVentillation getPersonnalTaxVentillation() {
		return personnalTaxVentillation;
	}

	public void setPersonnalTaxVentillation(TaxVentillation personnalTaxVentillation) {
		this.personnalTaxVentillation = personnalTaxVentillation;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
}
