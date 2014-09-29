
# Code : 

``` bash
cd ~/dev
git clone git@github.com:florent-andre/CleverTaxes.git
```

# Configuration apache

``` bash
mkdir -p ~/dev/www_aliases

cd /opt
ln -s ~/dev/www_aliases www

cd ~/dev/www_aliases

 # general link configuration
cd /etc/apache2/sites-enabled/
ln -s ~/dev/CleverTaxes/documentation/conf_apache_2.2 000-local.conf

!!!!
Cette configuration fontionne pour apache 2.2, il faut faire les modifications nécessaire au niveau de la gestions des droits pour que ca fonctionne en 2.4+ 
!!!!

sudo service apache2 restart

```

# installation Apache couchDB 

* Suivre le lien http://guide.couchdb.org/editions/1/fr/source.html

Pour créer un user suivre la partie :Security Considerations

# demarrer le serveur
``` bash
sudo -i -u couchdb couchdb -b

```

## lancer la bdd

``` bash
curl http://127.0.0.1:5984/
```
## pour checker que tout est ok, il y a l’interface d’administration Futon
http://127.0.0.1:5984/_utils/index.html

## Création de la base de données : 
``` bash
curl -X PUT http://127.0.0.1:5984/clevertaxes
```
## Couchdb CORS
* Config is visible here :http://wiki.apache.org/couchdb/CORS
enabling CORS

* http://localhost:5984/_utils/config.html

[httpd]
enable_cors = true

[cors]
origins = *

## Couchdb Views
Ds le dossier CleverTaxes/code/client/data, 2 views à créer:

1- Se connecter en tant que admin > Selectionner Temporary view ds la select tout en haut à droite > clic View Code > Copier le code fourni ds le fichier lines.js: 2 fonctions à créer (Map function et reduce function) > Save As > 
Design Document : _design/lines
View Name : lines

2- une deuxieme vue est necessaire : code fourni ds le fichier docs.js
Design Document : _design/docs
View Name : docs

# webSite :

## html client : 

* html & js code is in /code/client/

<pre>
cd /opt/www
ln -s ~/dev/CleverTaxes clevertaxes
</pre>

* Website is visible here : http://localhost/clevertaxes/code/client/

## Java server : 

### Stanbol

``` bash

cd ~/dev/
mkdir -p dev-apache/stanbol
cd dev-apache/stanbol
svn co https://svn.apache.org/repos/asf/stanbol/branches/release-0.12/
cd release-0.12
mvn clean install -DskipTests


```
### cleverTaxes server 

``` bash

cd ~/dev/CleverTaxes/code/server/
cd endpoint
mvn clean install

cd ../launcher
mvn clean install
```

* Start the server : 
``` bash
cd target
java -jar eu.ooffee.clevertaxes.launcher-3.jar
```

TODO : remove jsonjaxb & clevertaxes as they are not usefull anymore



# Dart editor : 

* download and install the dart editor here : https://www.dartlang.org/

# Cordova / Phone Gap client : 

## Get the command lines utilities

* Install node.js
 * https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#wiki-ubuntu-mint-elementary-os

* Cordova can be installed directly via node with
<pre>
sudo npm install -g cordova
</pre>

* Documentation about this npm is here : https://npmjs.org/package/cordova

## get the Sdk :


# documentation a revoir : 
* a ajouter dans le bashrc
** export PATH=$PATH:/home/florent/devel/dev-clever-taxes/code/phonegap/infra/adt-bundle-linux-x86_64-20131030/sdk/tools:/home/florent/devel/dev-clever-taxes/code/phonegap\
/infra/adt-bundle-linux-x86_64-20131030/sdk/platform-tools

** source .bashrc


* si problème d'installation de la dernière version de cordova 
** http://jeffmcmahan.info/blog/installing-cordova-on-linux/

* ajouter un device : 
** android avd

* suivre les instructin ici :
* http://docs.phonegap.com/en/3.3.0/guide_cli_index.md.html#The%20Command-Line%20Interface

* if erreur 
<pre>
com.android.sdklib.build.ApkCreationException: Debug Certificate expired on 5/6/12 7:56 PM
</pre>

* then : 
* rm ~/.android/debug.keystore


