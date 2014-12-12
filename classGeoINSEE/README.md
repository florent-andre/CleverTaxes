# RECHERCHE ET INDEXTION VIA APACHE STANDBOL


### Configuration d'un ClerezzaYard

Nous avons configuré un ClerezzaYard pour être utilisé avec un YardSite en utilisant
l'onglet Configuration de l'Apache Felix Webconsole http:// {Stanbol instance} /
system / console / ConfigMgr.
Figure 1: Exemple de configuration d'un ClerezzaYard pour un YardSite

### Configuration d'un YardSite 

Cette conf utilise l'instance du Yard précédemmentconfiguré (ClerezzaYard).

Figure 2: Exemple de configuration du YardSite

Une fois le ManagedSite crée, on le charge avec notre propre vocabulaire SKOS via
cette commande:
``` 
curl -i -X POST -H "Content-Type:application/rdf+xml"
"http://localhost:8080/entityhub/site/XplorYardSite/entity"-T{modelDefault.rdf}
``` 
Et le site est prêt. Les services RESTful d'un ManagedSite sont disponibles via le
modèle d'URL : http://{stanbol-instance}/entityhub/site/XplorYardSite.

###Description des données

Nous avons choisi d'exploiter entre autres les données RDF issues du
code officiel géographique (COG).
Les données reflètent l'état du code officiel géographique à la date de référence du
1er janvier 2012. Elles concernent notamment les différents niveaux administratifs
français (régions, départements, arrondissements, communes) et leurs liens
d'inclusion. 
Ces données RDF sont mises à disposition sous les termes de la licence "Licence
Ouverte" du site "data.gouv.fr"