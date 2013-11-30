package eu.ooffee.cleverTaxes.model;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlID;

public class BudgetLine {
	
	@XmlID
	@XmlElement
	int id;
	
	@XmlElement
	String label;
	
	@XmlElement
	int amount;
	
	@XmlElement
	int percentage;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public int getAmount() {
		return amount;
	}

	public void setAmount(int amount) {
		this.amount = amount;
	}

	public int getPercentage() {
		return percentage;
	}

	public void setPercentage(int percentage) {
		this.percentage = percentage;
	}
	
	

}
