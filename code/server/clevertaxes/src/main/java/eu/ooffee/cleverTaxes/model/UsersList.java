package eu.ooffee.cleverTaxes.model;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;

public class UsersList {
	
	@XmlElement
	List<User> users;

	public List<User> getUsers() {
		return users;
	}

	
	public void addUser(User user){
		if(users == null) users = new ArrayList<User>();
		users.add(user);
	}
	
	

}
