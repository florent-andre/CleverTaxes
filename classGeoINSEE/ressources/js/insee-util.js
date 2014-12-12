/*
 * code multi-select from http://davidstutz.github.io/bootstrap-multiselect/#further-examples
 * 
*/
function mutiselectCode() {

    $('#example22').multiselect({
        includeSelectAllOption: true,
        selectAllValue: 'multiselect-all',
        includeSelectAllDivider: true,
        buttonClass: 'btn',
        buttonWidth: 'auto',
        buttonText: function(options) {
            if (options.length == 0) {
                return 'None selected <b class="caret"></b>';
            }
            else if (options.length > 6) {
                return options.length + ' selected <b class="caret"></b>';
            }
            else {
                var selected = '';

                options.each(function() {
                    selected += $(this).text() + ', ';

                });
                return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
            }
        },
        onChange: function(element, checked) {
            if (checked == true) {
                //alert ("selected ");
                // action taken here if true
            }
            else if (checked == false) {
                if (confirm('Do you wish to deselect the element?')) {
                    // action taken here
                }
                else {
                    $("#example22").multiselect('select', element.val());
                }
            }
        }
    });
}
/*
 * affiche tous les triplets du noeud passé en url 
 * on recupere l'uri de type :"id=http://id.insee.fr/geo/commune/18111"
 * on cherche l'uri intermediaire : http://id.insee.fr/demo/populationLegale/commune/18111/2011
 * on liste tous les triplets,
 * et on charge un multi-select avec tous les prédicats
 * 
 */

function affichePopulation() {

    $("#testSearchResultText").text("... waiting for results ...");
    $("#testSearchResult").show();
    var url = window.location.href.replace(/\/$/, "");
    base = "http://localhost:8080/entityhub/site/inseePopulation/entity";
    var data = url.split('?')[1]; //"id=http://id.insee.fr/geo/commune/18111";
    //alert (data.split('='));
    $("#nodeId").append(data.split('=')[1]);
    $.ajax({
        type: "GET",
        beforeSend: function(req) {
            req.setRequestHeader("Accept", "application/rdf+xml");  //json par defaut
        },
        contentType: "application/json; charset=utf-8",
        url: base,
        data: data, //$("#findForm").serialize(),
        dataType: "text",
        cache: false,
        success: function(data) {

            rdfdata = $.rdf.databank([]);
            rdfdata.load(data, {});
            results = $.rdf({databank: rdfdata});

            results1 = results.where("?s <http://rdf.insee.fr/def/demo#population> ?o");
            var id = "id=" + results1[0].o.value._string;  //http://id.insee.fr/demo/populationLegale/commune/18111/2011
            
            base1 = "http://localhost:8080/entityhub/site/inseePopulation/entity";



            $.ajax({
                type: "GET",
                beforeSend: function(req) {
                    req.setRequestHeader("Accept", "application/rdf+xml");  //json par defaut
                },
                contentType: "application/json; charset=utf-8",
                url: base1,
                data: id, //$("#findForm").serialize(),
                dataType: "text",
                cache: false,
                success: function(data) {

                    rdfdata = $.rdf.databank([]);
                    rdfdata.load(data, {});
                    results = $.rdf({databank: rdfdata});
                    results1 = results.where("?s ?p ?o");

                    var nb = 1;
                    //console.log (results1.length );
                    if (results1.length != 0) {
                        //construire an array of object to apend select
                        /*var data = [
                         {label: "ACNP", value: "ACNP"},
                         {label: "test", value: "test"}
                         ];*/
                        var dataSelect = [];
                        var len = results1.length;
                        $("#PopulationTable")
                                .append("<thead><tr><th>#</th><th>Subject</th><th>Predicate</th><th>Object</th></tr></thead><tbody>");
                        for (i = 0; i < results1.length; i++) {
                            // console.log(results1[i].s.value._string);  //http://id.insee.fr/geo/commune/55368
                            //  console.log(results1[i].p.value._string); //file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/NomArr
                            // console.log(results1[i].o.value);         //Commercy
                            $("#PopulationTable")
                                    .append("<tr><td>" + nb + "</td><td>" + results1[i].s.value._string + "</td><td>" + results1[i].p.value._string + "</td><td>" + results1[i].o.value + "</td></tr>");
                            nb++;
                            //apend the select with differents predicate
                            dataSelect.push({
                                label: results1[i].p.value._string.split('#')[1],
                                value: results1[i].p.value._string
                            });

                        }

                        $("#PopulationTable").append("</tbody></table>");
                        $("#example22").multiselect('dataprovider', dataSelect);
                        /*
                         TO DO preselect all options
                         
                         */
                        $("#testSearchResult").hide();
                    }

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $("#testSearchResultText").text(
                            jqXHR.statusText + " - " + jqXHR.responseText);
                }
            });


        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#testSearchResultText").text(
                    jqXHR.statusText + " - " + jqXHR.responseText);
        }
    });
}

/*
 * cherche tous les triplets du texte saisi
 * affiche que les données répondant au filtre (multi-select values)
 * affiche aussi les subdivisions de type Rég|Dept|Arr|Canton|commune;
 * on fait appel à la fonction getSubdivisionsByNiveau(results,s,nbNiveau)
 * 
 */
function startTestSearch() {
    if (($('select#example22').val()) == null) {
        alert("any selected value !");
        return false;
    }

    $("#SearchResultTable").html("");
    var relpath = "/find";
    var ldpath = "@prefix igeo : <http://rdf.insee.fr/def/geo#> ;";

    base = window.location.href.replace(/\/$/, "");
    if (base.lastIndexOf(relpath) != (base.length - relpath.length)) {
        base = base + relpath;
    }
    base = "http://localhost:8080/entityhub/site/insee/find";

    var isPays = isRegion = isDepartement = isAarrondissemt = isCanton = isCommune = isArrondissementMunicipal = false;

    if ($.inArray('pays', $('select#example22').val()) > -1) {// selected
        isPays = true;
    }
    if ($.inArray('region', $('select#example22').val()) > -1) {
        isRegion = true;
    }
    if ($.inArray('departement', $('select#example22').val()) > -1) {
        isDepartement = true;
    }
    if ($.inArray('arrondissemt', $('select#example22').val()) > -1) {
        isAarrondissemt = true;
    }
    if ($.inArray('canton', $('select#example22').val()) > -1) {
        isCanton = true;

    }
    if ($.inArray('commune', $('select#example22').val()) > -1) {
        isCommune = true;
    }
    if ($.inArray('arrondissementMunicipal', $('select#example22').val()) > -1) {
        isArrondissementMunicipal = true;
    }


    $("#testSearchResultText").text("... waiting for results ...");
    $("#testSearchResult").show();
    /*
     TO DO
     rdfs:label "France de province"@fr ; 
     <http://id.insee.fr/geo/pays/france>   rdfs:label "France"@fr ;
     nom = (igeo:nom | rdfs:label[@fr]):: xsd:string; ajout dans ldpath marche pas
     mapping au niv de la configuration se site ne marche pas aussi //rdfs:label > http://rdf.insee.fr/def/geo#nom 
     */
    ldpath = "@prefix igeo : <http://rdf.insee.fr/def/geo#> ; typee = rdf:type :: xsd:string;nom = (igeo:nom | rdfs:label[@fr]):: xsd:string;commune      = igeo:codeCommune :: xsd:int;canton       = igeo:codeCanton :: xsd:int;arrondissement = igeo:codeArrondissement :: xsd:int;departement  = igeo:codeDepartement :: xsd:int;region       = igeo:codeRegion :: xsd:int;pays         = igeo:codePays :: xsd:int;	subdivisionDe1 = igeo:subdivisionDe /igeo:nom :: xsd:string;subdivisionDe2 = igeo:subdivisionDe / igeo:subdivisionDe /igeo:nom:: xsd:string; subdivisionDe3 = igeo:subdivisionDe / igeo:subdivisionDe /igeo:subdivisionDe/igeo:nom :: xsd:string;subdivisionDe4 = igeo:subdivisionDe /igeo:subdivisionDe / igeo:subdivisionDe /igeo:subdivisionDe/igeo:nom :: xsd:string;subdivisionDe5 = igeo:subdivisionDe /igeo:subdivisionDe /igeo:subdivisionDe / igeo:subdivisionDe /igeo:subdivisionDe/igeo:nom :: xsd:string;subdivisionDe6 = igeo:subdivisionDe /igeo:subdivisionDe /igeo:subdivisionDe /igeo:subdivisionDe / igeo:subdivisionDe /igeo:subdivisionDe/igeo:nom :: xsd:string;subdivisionDirecte = igeo:subdivisionDirecte :: xsd:anyURI;";

    var data = "name=" + $("#testSearchValue").val() + "&limit=1000&offset=0&field=http://rdf.insee.fr/def/geo#nom&ldpath=" + ldpath;
    $.ajax({
        type: "POST",
        beforeSend: function(req) {

            req.setRequestHeader("Accept", "application/rdf+xml");  //json par defaut
        },
        contentType: "application/json; charset=utf-8",
        url: base,
        data: data, //$("#findForm").serialize(),
        dataType: "text",
        cache: false,
        success: function(data) {

            rdfdata = $.rdf.databank([]);
            rdfdata.load(data, {});
            results = $.rdf({databank: rdfdata});
            results1 = results.where("?s ?p ?o");
            /*
            for (i=0; i< results1.length;i++){
                console.log (results1[i].s.value.toString());
                console.log (results1[i].p.value.toString());
                console.log (results1[i].o.value);
            }
            */
            if (results1.length > 1) {

                //traitement particulier pour les arrondisements municipales: on teste sur le type
                //var valeur = "http://rdf.insee.fr/def/geo#ArrondissementMunicipal";
                if (isArrondissementMunicipal) {
                    ArrMunicipal = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/typee> ?o");
                    //console.log (ArrMunicipal.length) 
                    for (i = 0; i < ArrMunicipal.length; i++) {
                        if (ArrMunicipal[i].o.value == "http://rdf.insee.fr/def/geo#ArrondissementMunicipal") {
                            $("#SearchResultTable").append("<thead><tr><th>#</th><th>URI</th><th>Type</th><th>Nom</th><th>Rég|Dept|Arr|Commune</th></tr></thead><tbody>");
                            break;
                        }
                    }
                    nb = 1;
                    for (i = 0; i < ArrMunicipal.length; i++) {
                        if (ArrMunicipal[i].o.value == "http://rdf.insee.fr/def/geo#ArrondissementMunicipal") {
                            nom = results1.where("<" + ArrMunicipal[i].s.value + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")
                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td><a href='population.html?id=" + ArrMunicipal[i].s.value + "'>" + ArrMunicipal[i].s.value + "</a></td><td>" + ArrMunicipal[i].o.value + "</td><td>" + nom[0].o.value + "</td><td>" + getSubdivisionsByNiveau(results1, ArrMunicipal[i].s.value, 6, true) + "<td></tr>");
                            nb++;

                        }
                    }
                }

                if (isCommune) {
                    communes = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/commune> ?o");
                    nb = 1;
                    if (communes.length > 0) {
                        $("#SearchResultTable").append("<tr><th>#</th><th>URI</th><th>Code Commune</th><th>Nom</th><th>Rég|Dept|Arr|Canton</th></tr>");
                        for (j = 0; j < communes.length; j++) {

                            //href=population.html?commune/getCodeINSEE(results1, communes[j].s.value)
                            //dans le cas ou on veur un seul appel serveur
                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td><a href='population.html?id=" + communes[j].s.value + "'>" + communes[j].s.value + "</a></td><td>" + communes[j].o.value + "</td><td>" + getNom(results1, communes[j].s.value) + "</td><td>" + getSubdivisionsByNiveau(results1, communes[j].s.value, 5, true) + "<td></tr>");
                            nb++;
                        }
                    }
                }

                if (isCanton) {
                    cantons = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/canton> ?o");
                    nb = 1;
                    if (cantons.length > 0) {
                        $("#SearchResultTable").append("<tr><th>#</th><th>URI</th><th>Code Canton</th><th>Nom</th><th>Rég|Dept|Arr</th></tr>");
                        for (j = 0; j < cantons.length; j++) {
                            nom = results1.where("<" + cantons[j].s.value + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")
                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td><a href='population.html?id=" + cantons[j].s.value + "'>" + cantons[j].s.value + "</a></td><td>" + cantons[j].o.value + "</td><td>" + nom[0].o.value + "</td><td>" + getSubdivisionsByNiveau(results1, cantons[j].s.value, 4) + "<td></tr>");
                            nb++;
                        }
                    }
                }

                if (isAarrondissemt) {
                    arrondissements = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/arrondissement> ?o");
                    nb = 1;
                    if (arrondissements.length > 0) {
                        $("#SearchResultTable").append("<tr><th>#</th><th>URI</th><th>Code Arrondissement</th><th>Nom</th><th>Rég|Dept</th></tr>");
                        for (j = 0; j < arrondissements.length; j++) {
                            nom = results1.where("<" + arrondissements[j].s.value + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")
                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td><a href='population.html?id=" + arrondissements[j].s.value + "'>" + arrondissements[j].s.value + "</td><td>" + arrondissements[j].o.value + "</td><td>" + nom[0].o.value + "</td><td>" + getSubdivisionsByNiveau(results1, arrondissements[j].s.value, 3, false) + "<td></tr>");
                            nb++;
                        }
                    }
                }

                if (isDepartement) {
                    departements = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/departement> ?o");
                    //console.log (departements.length) ;
                    nb = 1;
                    if (departements.length > 0) {
                        //Commercy
                        $("#SearchResultTable").append("<tr><th>#</th><th>URI</th><th>Code Departement</th><th>Nom</th><th>Région</th></tr>");
                        for (j = 0; j < departements.length; j++) {

                            nom = results1.where("<" + departements[j].s.value + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")

                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td><a href='population.html?id=" + departements[j].s.value + "'>" + departements[j].s.value + "</a></td><td>" + departements[j].o.value + "</td><td>" + getNom(results1, departements[j].s.value) + "</td><td>" + getSubdivisionsByNiveau(results1, departements[j].s.value, 2, false) + "<td></tr>");
                            nb++;
                        }
                    }
                }


                if (isRegion) {
                    regions = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/region> ?o");
                    nb = 1;
                    if (regions.length > 0) {
                        $("#SearchResultTable").append("<tr><th>#</th><th>URI</th><th>Code Région</th><th>Nom</th><th>subdivisionDe</th></tr>");
                        for (j = 0; j < regions.length; j++) {
                            nom = results1.where("<" + regions[j].s.value + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")
                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td><a href='population.html?id=" + regions[j].s.value + "'>" + regions[j].s.value + "</a></td><td>" + regions[j].o.value + "</td><td>" + nom[0].o.value + "</td><td>" + getSubdivisionsByNiveau(results1, regions[j].s.value, 1, false) + "<td></tr>");
                            nb++;

                        }
                    }
                }

                if (isPays) {
                    paysTab = results1.where("?s <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/pays> ?o");

                    nb = 1;
                    if (paysTab.length > 0) {
                        $("#SearchResultTable").append("<tr><th>#</th><th>URI</th><th>Code Pays</th><th>Nom</th></tr>");
                        for (j = 0; j < paysTab.length; j++) {
                            nom = results1.where("<" + paysTab[j].s.value + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")

                            $("#SearchResultTable")
                                    .append("<tr><td>" + nb + "</td><td>" + paysTab[j].s.value + "</td><td>" + paysTab[j].o.value + "</td><td>" + nom[0].o.value + "</td></tr>");
                            nb++;
                        }
                    }
                }



                $("#SearchResultTable").append("</tbody></table>");
            }
            $("#testSearchResultText").text("");//data
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#testSearchResultText").text(
                    jqXHR.statusText + " - " + jqXHR.responseText);
        }
    });
}



function getNom(result, s) {
    res = "";
    nom = result.where("<" + s + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/nom> ?o")
    if (nom.length == 0)
        res = s;
    else
        res = nom[0].o.value;
    return res;

}

function getCodeINSEE(result, s) {
    res = "";
    nom = result.where("<" + s + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/codeINSEE> ?o")
    if (nom.length == 0)
        res = s;
    else
        res = nom[0].o.value;
    return res;
}


function getSubdivisionDe(result, p) {
    subs = result.where("<" + p + ">    <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/subdivisionDe> ?o")
    if (subs.length == 1) {
        res = getSubdivisionDe(result, subs[0].o.value);
        nom = getNom(result, subs[0].o.value) + "/" + nom;
    } else {
        for (var i = subs.length - 1; i >= 0; i--) {
            subs[i]
        }
        ;
    }
}


/*
 fonction recursive qui cherche toutes les subdivision d'un noeud
 ne fonctionne que lorsque on charge tous les triplets 
 dans on cas, on charge que les triplets concernant le texte à chercher 
 */

function getSubdivisions(result, s) { // un seul niveau
    res = "";

    subs = result.where("<" + s + "> <file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/subdivisionDe> ?o")

    if (subs.length == 0)
        return res;
    else {
        //console.log (subs[0].s.value._string); //http://id.insee.fr/geo/region/24
        //console.log (subs[0].o.value);        //http://id.insee.fr/geo/territoireFrancais/franceDeProvince
        res = subs[0].o.value + "//" + getSubdivisions(result, subs[0].o.value) + "/" + res;
        //console.log ("res = "+res);
    }
    return res;
}
/*
 * nb est le nombre de niveaux
 * commune ==true ds le cas que le noeud est une commune, prendre que le premier resultat
 * pour une commune, il ya 2 valeurs dans la prop SubdivisionDe
 */
function getSubdivisionsByNiveau(result, s, nb, commune) { 
    res = "";
    for (var i = 1; i <= nb; i++) {
        var p = "file:///home/wiem/dev/urbanxplor/SiteUrbanXplorer/subdivisionDe" + i;
        //console.log ("concat essai :" +p);
        subs = result.where("<" + s + "> <" + p + "> ?o")
        //console.log ("length subs :"+subs.length); //1
        if (subs.length == 0)
            return res;
        else {
            //petite subtilite pour les communes, on doit prndre la valeur 1
            if ((i == 1) && commune) {
                res = subs[1].o.value + " | " + res;
            } else {
                //console.log ("subs[1] =" +subs[1].s.value._string)
                //console.log (subs[0].s.value._string); //http://id.insee.fr/geo/region/24
                //console.log ("subs[1] =" +subs[1].o.value)
                //console.log (subs[0].o.value);        //http://id.insee.fr/geo/territoireFrancais/franceDeProvince
                res = subs[0].o.value + " | " + res;
                //console.log ("res = "+res);
            }
        }
    }
    return res;
}
/*
 * affiche que les triplets des prédicats selectionnées
 * on recupere l'uri de type :"id=http://id.insee.fr/geo/commune/18111"
 * on cherche l'uri intermediaire : http://id.insee.fr/demo/populationLegale/commune/18111/2011
 * eton liste tous les triplets des prédicats selectionnées,
 * 
 */
function afficheDataByPredicate() {

    $("#PopulationTable").html("");
    $("#testSearchResultText").text("... waiting for results ...");
    $("#testSearchResult").show();
    var url = window.location.href.replace(/\/$/, "");
    base = "http://localhost:8080/entityhub/site/inseePopulation/entity";
    var data = url.split('?')[1];//"id=http://id.insee.fr/geo/commune/18111";
   
    $.ajax({
        type: "GET",
        beforeSend: function(req) {
            req.setRequestHeader("Accept", "application/rdf+xml");  //json par defaut
        },
        contentType: "application/json; charset=utf-8",
        url: base,
        data: data, //$("#findForm").serialize(),
        dataType: "text",
        cache: false,
        success: function(data) {

            rdfdata = $.rdf.databank([]);
            rdfdata.load(data, {});
            results = $.rdf({databank: rdfdata});

            results1 = results.where("?s <http://rdf.insee.fr/def/demo#population> ?o");
            var id = "id=" + results1[0].o.value._string;  //http://id.insee.fr/demo/populationLegale/commune/18111/2011
            base1 = "http://localhost:8080/entityhub/site/inseePopulation/entity";



            $.ajax({
                type: "GET",
                beforeSend: function(req) {
                    req.setRequestHeader("Accept", "application/rdf+xml");  //json par defaut
                },
                contentType: "application/json; charset=utf-8",
                url: base1,
                data: id, //$("#findForm").serialize(),
                dataType: "text",
                cache: false,
                success: function(data) {

                    rdfdata = $.rdf.databank([]);
                    rdfdata.load(data, {});
                    results = $.rdf({databank: rdfdata});
                    results1 = results.where("?s ?p ?o");

                    var nb = 1;

                    if (results1.length != 0) {

                        $("#PopulationTable")
                                .append("<thead><tr><th>#</th><th>Subject</th><th>Predicate</th><th>Object</th></tr></thead><tbody>");
                        for (i = 0; i < results1.length; i++) {
                            if ($.inArray(results1[i].p.value._string, $('select#example22').val()) > -1) {// selected
                                $("#PopulationTable")
                                        .append("<tr><td>" + nb + "</td><td>" + results1[i].s.value._string + "</td><td>" + results1[i].p.value._string + "</td><td>" + results1[i].o.value + "</td></tr>");
                                nb++;

                            }

                        }



                        $("#PopulationTable").append("</tbody></table>");
                        $("#testSearchResult").hide();

                    }

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    $("#testSearchResultText").text(
                            jqXHR.statusText + " - " + jqXHR.responseText);
                }
            });


        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#testSearchResultText").text(
                    jqXHR.statusText + " - " + jqXHR.responseText);
        }
    });

}

