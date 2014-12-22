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
* pour verifuer que l'install s'est bien passée et avoir la version
<pre>
cordova --version
</pre>
* Documentation about this npm is here : https://npmjs.org/package/cordova

## Tester sur un mobile :
#pour compiler pour ios : il suffit d'avoir un mac, installer Xcode depuis l'app Store et le lancer
#pour compiler pour Android : installer dans l'ordre jdk, Android Sdk et Ant et ajouter les fichiers binaires dans le path
 *http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html
 *http://www.android-dev.fr/installation-du-sdk-android-sous-ubuntu#.UvH463jiCPJ
 *http://ant.apache.org/bindownload.cgi
* a ajouter dans le bashrc: le path vers sdk/tools,sdk/platform-tools et le ant/bin
* pour se faire se placer dans dossier binaire a ajouter, Par défaut ::
<pre> 
cd Téléchargements/
cd android-sdk-linux/tools/
echo "export PATH=${PATH}:$(pwd)" >> ~/.bashrc
. ~/.bashrc
</pre>
** De meme pour pour android-sdk-linux/platform-tools/
** et le soddier bin de Apache Ant
** export PATH=$PATH:/home/florent/devel/dev-clever-taxes/code/phonegap/infra/adt-bundle-linux-x86_64-20131030/sdk/tools:/home/florent/devel/dev-clever-taxes/code/phonegap\
/infra/adt-bundle-linux-x86_64-20131030/sdk/platform-tools

** source .bashrc


* si problème d'installation de la dernière version de cordova 
** http://jeffmcmahan.info/blog/installing-cordova-on-linux/

* ajouter un device : 
** android avd

* suivre les instructin ici :
* http://docs.phonegap.com/en/3.3.0/guide_cli_index.md.html#The%20Command-Line%20Interface
* ou ici :
* http://android-er.blogspot.fr/2009/10/create-android-virtual-device-avd-in.html
Avant de crér une AVD, vérifier les targets de votre système ici your system.
<pre> 
cd ~/android-sdk-linux_x86-1.6_r1/tools 
$./android list targets
</pre>


* if erreur 
<pre>
com.android.sdklib.build.ApkCreationException: Debug Certificate expired on 5/6/12 7:56 PM
</pre>

* then : 
* rm ~/.android/debug.keystore


