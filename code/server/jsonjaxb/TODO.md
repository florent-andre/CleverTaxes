
* voir pour faire du refactoring et avoir des classes statiques de configurations sous la main...

=== voir pour supprimer la classe statique de configuration des path :
* ModelNS

=== faire un utilitaire pour la deserialisation des éléments sans root : 

cf 
/home/florent/devel/dev-clever-taxes/code/server/clevertaxes/src/test/java/eu/ooffee/cleverTaxes/models/TestSerialization.java
===
@Test
	public void testBudgetLineDeserialization() throws JAXBException{
		
		InputStream file = getClass().getResourceAsStream("/budget_lines.json");
		StreamSource ss = new StreamSource(file);
		
		JAXBElement<BudgetLines> je = MarshalServicer.getUnmarshaller().unmarshal(ss,BudgetLines.class);
		
		BudgetLines lines = je.getValue();
		
		
		assertNotNull(lines);
		
		assertEquals(32, lines.getLines().size());
		
	}
===

=== faire de la doc pour les fichiers
jaxb.index
jaxb.properties

=== faire un plugin maven pour la génération automatique de ces éléments (fichiers statiques)

