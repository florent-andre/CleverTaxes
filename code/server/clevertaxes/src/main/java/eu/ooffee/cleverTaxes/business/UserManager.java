package eu.ooffee.cleverTaxes.business;

import eu.ooffee.cleverTaxes.model.UsersList;

public class UserManager {

	private static UsersList users;
	
	public static UsersList getUsers(){
		//TODO : fetch user list from xml
		if(users == null) users = new UsersList();
		return users;
	}
}
