package eu.ooffee.cleverTaxes.model;

import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

public class BudgetLines {
	
	@XmlElement
	List<BudgetLine> lines;

	public List<BudgetLine> getLines() {
		return lines;
	}

	public void setLines(List<BudgetLine> lines) {
		this.lines = lines;
	}
	
	

}
