/*
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
package org.lh.stanbol.enhancer.jersey.resource;

import static javax.ws.rs.core.MediaType.APPLICATION_FORM_URLENCODED;
import static javax.ws.rs.core.MediaType.TEXT_HTML;
import static javax.ws.rs.core.MediaType.WILDCARD;
import static javax.ws.rs.core.MediaType.MULTIPART_FORM_DATA;
import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static org.apache.clerezza.rdf.core.serializedform.SupportedFormat.RDF_XML;
//import static org.apache.stanbol.commons.web.base.CorsHelper;
import static org.apache.stanbol.commons.web.base.CorsHelper.addCORSOrigin;
import static org.apache.stanbol.commons.web.base.CorsHelper.enableCORS;
import static org.apache.stanbol.commons.web.base.utils.MediaTypeUtil.getAcceptableMediaType;
import static org.apache.stanbol.entityhub.jersey.utils.LDPathHelper.getLDPathParseExceptionMessage;
import static org.apache.stanbol.entityhub.jersey.utils.LDPathHelper.prepareQueryLDPathProgram;
import static org.apache.stanbol.entityhub.jersey.utils.LDPathHelper.transformQueryResults;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;
import java.util.UUID;

import javax.servlet.ServletContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.Encoded;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.FormParam;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;



import javax.servlet.ServletContext;
import static javax.ws.rs.HttpMethod.DELETE;
import static javax.ws.rs.HttpMethod.POST;
import static javax.ws.rs.HttpMethod.GET;
import static javax.ws.rs.HttpMethod.OPTIONS;

import org.apache.clerezza.rdf.core.Graph;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Triple;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.access.WeightedTcProvider;
import org.apache.clerezza.rdf.core.impl.SimpleMGraph;
import org.apache.clerezza.rdf.core.impl.TripleImpl;
import org.apache.clerezza.rdf.core.serializedform.Parser;
import org.apache.clerezza.rdf.core.serializedform.Serializer;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.stanbol.commons.indexedgraph.IndexedMGraph;
import org.apache.stanbol.commons.namespaceprefix.NamespacePrefixService;
import org.apache.stanbol.commons.web.base.ContextHelper;

import org.apache.stanbol.commons.web.base.resource.BaseStanbolResource;
import org.apache.stanbol.enhancer.servicesapi.EngineException;
import org.apache.stanbol.enhancer.servicesapi.rdf.Properties;
import org.apache.stanbol.entityhub.core.query.FieldQueryImpl;
import org.apache.stanbol.entityhub.core.query.QueryResultListImpl;
import org.apache.stanbol.entityhub.jersey.utils.JerseyUtils;
import org.apache.stanbol.entityhub.ldpath.EntityhubLDPath;
import org.apache.stanbol.entityhub.ldpath.backend.SiteManagerBackend;
import org.apache.stanbol.entityhub.ldpath.query.LDPathFieldQueryImpl;
import org.apache.stanbol.entityhub.ldpath.query.LDPathSelect;
import org.apache.stanbol.entityhub.model.clerezza.RdfValueFactory;
import org.apache.stanbol.entityhub.servicesapi.EntityhubException;
import org.apache.stanbol.entityhub.servicesapi.model.Entity;
import org.apache.stanbol.entityhub.servicesapi.model.Representation;
import org.apache.stanbol.entityhub.servicesapi.model.ValueFactory;
import org.apache.stanbol.entityhub.servicesapi.query.FieldQuery;
import org.apache.stanbol.entityhub.servicesapi.query.QueryResultList;
import org.apache.stanbol.entityhub.servicesapi.query.TextConstraint;
import org.apache.stanbol.entityhub.servicesapi.query.TextConstraint.PatternType;
import org.apache.stanbol.entityhub.servicesapi.site.SiteManager;
import org.apache.stanbol.entityhub.servicesapi.util.AdaptingIterator;
import org.apache.stanbol.entityhub.servicesapi.yard.YardException;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.codehaus.jettison.json.JSONArray;
import org.lh.stanbol.graphUtil.GraphUtils;
import org.lh.stanbol.ontoHisto.Patch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import at.newmedialab.ldpath.exception.LDPathParseException;
import at.newmedialab.ldpath.model.programs.Program;

import com.sun.jersey.api.view.Viewable;
import com.sun.jersey.core.header.FormDataContentDisposition;
import com.sun.jersey.multipart.FormDataParam;

import eu.lh.registry.broadcaster.api.Broadcaster;
import eu.lh.skosifier.api.Skosifier;
import eu.lh.skosifier.api.SkosifierFactory;
import eu.lh.skosifier.impl.SkosifierFactoryImpl;
import eu.lh.skosifier.metadata.MetadataGenerator;
import eu.lh.utils.ns.LHOntology;
import eu.lh.utils.url.LHbaseURL;
import eu.lh.utils.ns.LHURNNS;
import eu.lh.utils.ns.LHbaseURNNS;
import eu.lh.utils.ns.SkosEnum;
import eu.lh.utils.ns.SkosPropertiesEnum;
import eu.lh.utils.ns.SkosReferencesEnum;
//import eu.lh.utils.url.LHbaseURL;


/**
 * RESTful interface to browse the list of available engines and allow to call them in a stateless,
 * synchronous way.
 * <p>
 * If you need the content of the extractions to be stored on the server, use the StoreRootResource API
 * instead.
 * @param <e>
 */
@Path("/skosifier")
@Encoded
public class SkosifierRootResource<e> extends BaseStanbolResource {

	@Context
	protected ServletContext servletContext;
    private final Logger log = LoggerFactory.getLogger(getClass());

    //protected Skosifier skosifier;
    protected SkosifierFactory skosifierFactory;
    protected TcManager tcManager;

    protected Serializer serializer;
    
    protected Parser parser;
    
    protected Broadcaster broadcast;
    
    public SkosifierRootResource(@Context ServletContext context) {
        // bind the job manager by looking it up from the servlet request context
        //jobManager = ContextHelper.getServiceFromContext(EnhancementJobManager.class, context);
    	//skosifier = ContextHelper.getServiceFromContext(Skosifier.class, context);
    	skosifierFactory = ContextHelper.getServiceFromContext(SkosifierFactory.class, context);
        tcManager = ContextHelper.getServiceFromContext(TcManager.class, context);
        serializer = ContextHelper.getServiceFromContext(Serializer.class, context);
        parser = ContextHelper.getServiceFromContext(Parser.class, context);
        broadcast = ContextHelper.getServiceFromContext(Broadcaster.class, context);
    }
    
    @OPTIONS
    public Response handleCorsPreflight(@Context HttpHeaders headers){
        ResponseBuilder res = Response.ok();
        log.error("DANS LE OPTION 0");
       // ResponseBuilder res = Response.ok();
        enableCORS(servletContext,res, headers);
      
        
       
        //res.addHeader("Access-Control-Allow-Origin", "*");
        //res.header(arg0, arg1)
        return res.build();
    }
    
    

    @GET
    @Produces(TEXT_HTML)
    public Response get(@Context HttpHeaders headers) {
        ResponseBuilder res = Response.ok(new Viewable("index", this),TEXT_HTML);
        addCORSOrigin(servletContext,res, headers);
        return res.build();
    }

    @GET
    @Consumes(WILDCARD)
    public Response getGraph(@QueryParam(value = "uri") String uri,
                                    @Context HttpHeaders headers){
    	MGraph graph = tcManager.getMGraph(new UriRef(LHbaseURNNS.thesaurus.concat(uri)));
    	return okMGraphResponse(headers, graph);
    }
    
    @DELETE
    @Consumes(WILDCARD)
    public Response deleteGraph(@QueryParam(value = "uri") String uri,
                                    @Context HttpHeaders headers){
    	del(uri,LHbaseURNNS.thesaurus);
    	del(uri,LHbaseURNNS.metadata);
    	del(uri,LHbaseURNNS.history);
    	
    	ResponseBuilder res = Response.ok(uri+" deleted !",TEXT_HTML);
    	addCORSOrigin(servletContext,res, headers);
    	return res.build();
    }
    
    //TODO : create endpoint for each like skosifier/thesaurus?uri=
    //sksosifier/metadata?uri=
    //skosifier/history?uri=
    @DELETE
    @Path("/history")
    @Consumes(WILDCARD)
    public Response delete(@QueryParam(value="uri") String uri,
    						@Context HttpHeaders headers){
    	String deleted = del(uri, LHbaseURNNS.history);
    	
    	ResponseBuilder res = Response.ok(deleted+" deleted !",TEXT_HTML);
    	addCORSOrigin(servletContext,res, headers);
    	return res.build();
    }
    
    public String del(String uriUrn, String domain){
    	String graphToDelete = StringUtils.startsWith(uriUrn, domain) ? uriUrn : domain.concat(uriUrn);
    	tcManager.deleteTripleCollection(new UriRef(graphToDelete));
    	return graphToDelete;
    }
    
    /////////////////////////
    // temporary function only for quadra migration. Remove it as soon as done
    // only used to remove old ontologies graphs
    ////////////////////////
    @Path("/tempDel")
    @DELETE
    @Consumes(WILDCARD)
    public Response tempDelete(@QueryParam(value = "model") String modelName,
        						@Context HttpHeaders headers){
    	
    	tcManager.deleteTripleCollection(new UriRef("urn:x-onto-utils:skosOntology" + modelName));
    	
    	ResponseBuilder res = Response.ok("DONE ! ");
    	
    	addCORSOrigin(servletContext,res, headers);
    	return res.build();
    	
    }
    
    //TODO : change the endpoint
    @Path("/copy")
    @POST
    @Consumes(WILDCARD)
    public Response copyThesaurus(@QueryParam(value = "uri") String uri, @QueryParam(value = "uriCopy") String uriCopy,
                                    @Context HttpHeaders headers){
    	
    	MGraph graph = tcManager.getMGraph(new UriRef(LHbaseURNNS.thesaurus.concat(uri)));
    	MGraph graphMetadata = tcManager.getMGraph(new UriRef(LHbaseURNNS.metadata.concat(uri)));
    	
    	MGraph graph2 = tcManager.createMGraph(new UriRef(LHbaseURNNS.thesaurus.concat(uriCopy)));
    	MGraph graphMetadata2 = tcManager.createMGraph(new UriRef(LHbaseURNNS.metadata.concat(uriCopy)));
    	
    	// Thesaurus graph
    	GraphUtils.copyGraph(graph, uri, graph2, uriCopy);
    	// Metadata Graph 
    	GraphUtils.copyGraph(graphMetadata, uri, graphMetadata2, uriCopy);    	
    	
    	ResponseBuilder res = Response.ok(new Viewable("index", this),TEXT_HTML);
    	
    	addCORSOrigin(servletContext,res, headers);
    	return res.build();
    }
    
    
    
    
    @Path("/metadata")
    @GET
    @Consumes(WILDCARD)
    public Response getMetadataGraph(@QueryParam(value = "for") String uri,
                                    @Context HttpHeaders headers){
    	
    	MGraph graph = tcManager.getMGraph(new UriRef(LHbaseURNNS.metadata.concat(uri)));
    	return okMGraphResponse(headers, graph);
    }
    
    
    @Path("/diagnostic")
    @GET
    @Consumes(WILDCARD)
    public Response createFromScratchDiagnostic(@QueryParam(value="author") String author, @Context HttpHeaders headers){
    	MGraph mg = null;
    	List<String> l = getGraphList();
    	
    	SortedSet<WeightedTcProvider> list = tcManager.getProviderList();
    	Iterator<WeightedTcProvider> iter = list.iterator();
    	while(iter.hasNext()){
    		WeightedTcProvider provider = iter.next();
    		log.error("========= nouveau");
    		log.error(""+provider.getWeight());
    	}
    	String gID = UUID.randomUUID().toString();
    	//String test = LHbaseURL.xplorBaseThesaurus;
		UriRef gname = new UriRef(LHbaseURNNS.thesaurus.concat(LHbaseURL.xplorBaseThesaurus + author +"/"+ gID));
		String uri = LHbaseURNNS.thesaurus.concat(LHbaseURL.xplorBaseThesaurus + author +"/"+ gID);
		mg = tcManager.createMGraph(gname);
		
		ResponseBuilder rb = Response.ok(uri);
		addCORSOrigin(servletContext,rb, headers);
		return rb.build();
    }
    
    
    @Path("/metadata/all")
    @GET
    @Consumes(WILDCARD)
    public Response getAllMetadataGraph(@QueryParam(value = "for") String uri,
                                    @Context HttpHeaders headers){
    	List<String> l = getGraphList();
    	MGraph result = new SimpleMGraph();
    	for(String s : l){
    		result.addAll(tcManager.getMGraph(new UriRef(LHbaseURNNS.metadata.concat(s))));
    	}
    	return okMGraphResponse(headers, result);
    }
    
    //todo make this function more generic in order to provide any kind of graphs :
    // ==> getGraphList(graphURNNSType)
    private List<String> getGraphList() {
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator();
    	List<String> result = new ArrayList<String>();
    	while (iter.hasNext()){
    		//Filter "thesaurus" based on graph's URN NS
    		UriRef gURI = iter.next();
    		if(gURI.getUnicodeString().startsWith(LHbaseURNNS.thesaurus)){
    			result.add(gURI.getUnicodeString().replaceFirst(LHbaseURNNS.thesaurus, ""));
    		}
    	}
    	return result;
    }
    
    @Path("/metadata/history")
    @GET
    @Consumes(WILDCARD)
    public Response getHistoryMetadataGraph(@QueryParam(value = "for") String uri,
                                    @Context HttpHeaders headers){
    	MGraph mg = getHistory(LHURNNS.metadata, uri);
    	return okMGraphResponse(headers, mg);
    }
    
    @Path("/graphlist")
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getGraphList(@Context HttpHeaders headers) throws JSONException {
    	JSONObject jo = new JSONObject();
    	List<String> l = getGraphList();
    	jo.put("graphUri", l);
    	ResponseBuilder rb = Response.ok(jo.toString());
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    
    @Path("/graphlist/all")
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getGraphListAll(@Context HttpHeaders headers) throws JSONException {
    	//send all graph with internal name
    	JSONObject jo = new JSONObject();
    	JSONArray graphUri = new JSONArray();
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator(); 
    	while (iter.hasNext()){
    		UriRef gURI = iter.next();
    		graphUri.put(gURI.getUnicodeString());
    	}
    	jo.put("graphUri", graphUri);
    	ResponseBuilder rb = Response.ok(jo.toString());
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    @Path("/graphlist/byauthor")
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUriGraphListAllByAuthor(@QueryParam(value = "author") String author,@Context HttpHeaders headers) throws JSONException {
    	//send all graph with internal name
    	JSONObject jo = new JSONObject();
    	JSONArray graphUri = new JSONArray();
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator(); 
    	while (iter.hasNext()){
    		UriRef gURI = iter.next();
    		if (gURI.getUnicodeString().contains(author))
    		{
    		graphUri.put(gURI.getUnicodeString());
    		}
    	}
    	jo.put("graphUri", graphUri);
    	ResponseBuilder rb = Response.ok(jo.toString());
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    @Path("/graphlist/graphbyauthor")
    @GET
    @Consumes(WILDCARD)
    public Response getGraphListAllByAuthor(@QueryParam(value = "author") String author,@Context HttpHeaders headers) throws JSONException {
    	//send all graph with internal name
    	JSONObject jo = new JSONObject();
    	JSONArray graphUri = new JSONArray();
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator();
    	SimpleMGraph graphComplet = new SimpleMGraph();
    	while (iter.hasNext()){
    		UriRef gURI = iter.next();
    		if (gURI.getUnicodeString().contains(author))
    		{
    			//graphUri.put(gURI.getUnicodeString());
    			graphComplet.addAll(tcManager.getMGraph(gURI));
    		}
    	}
    	return okMGraphResponse(headers, graphComplet);
    }
    
    @Path("/graphlist/get")
    @OPTIONS
    public Response addCorsPreflight(@Context HttpHeaders headers){
        ResponseBuilder res = Response.ok();
        enableCORS(servletContext,res, headers);
        return res.build();
    }
    
    @Path("/graphlist/get")
    @GET
    @Consumes(WILDCARD)
    public Response getGraphFromInternal(@QueryParam(value = "id") String uri,
                                    @Context HttpHeaders headers){
    	MGraph graph = tcManager.getMGraph(new UriRef(uri));
    	ResponseBuilder rb = Response.ok("ok");
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    
    
    //TODO : rename this endpoint to "mapping"
    //provide getAllmappings utility
    @Path("/graphlink")
    @GET
    @Consumes(WILDCARD)
    public Response getGraphLink(@Context HttpHeaders headers,
    			@QueryParam(value = "graphOne") String graphOne,
    			@QueryParam(value = "graphTwo") String graphTwo) throws JSONException {
    	//TODO : use URN NS for filtering results
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator();
    	UriRef o1 = new UriRef(graphOne);
		UriRef o2 = new UriRef(graphTwo);
		System.out.println(o1);
		System.out.println(o2);

		boolean finded = false;
    	MGraph mg = null;

    	while (iter.hasNext() && !finded){
    		UriRef rf = iter.next();
 
    		mg = tcManager.getMGraph(rf);
    		Triple tun = new TripleImpl(rf, LHOntology.mappedGraph.getProperty(), o1);
    		Triple tde = new TripleImpl(rf, LHOntology.mappedGraph.getProperty(), o2);
    		
    		//System.out.println("rf : " + rf);
    		//System.out.println(LHOntology.mappedGraph.getProperty());
    		
    		Collection<Triple> cl = new ArrayList<Triple>();
    		cl.add(tun);
    		cl.add(tde);
    		//System.out.println(cl.size());
    		
			if(mg.containsAll(cl)){
				finded = true;
				System.out.println("true");
			}

    	}
    	if(!finded){
    		//TODO : use the NAmeGenerator utility to get the graphName (add methods to namegenerator for this usecase)
    		String gID = UUID.randomUUID().toString();
    		UriRef gname = new UriRef(LHbaseURNNS.mapping + LHbaseURL.lhBaseMapping + gID);
    		UriRef gref = new UriRef(LHbaseURNNS.mapping + LHbaseURL.lhBaseMapping + gID);

    		mg = tcManager.createMGraph(gname);
        	mg.add(new TripleImpl(gref, Properties.RDF_TYPE, LHOntology.graphMapping.getProperty()));
        	mg.add(new TripleImpl(gref, LHOntology.mappedGraph.getProperty(), o1));
        	mg.add(new TripleImpl(gref, LHOntology.mappedGraph.getProperty(), o2));
    	}
    	
    	return okMGraphResponse(headers, mg);
    }
    

    
    
    @Path("/graphlinks")
    @GET
    @Consumes(WILDCARD)
    public Response getGraphLinks(@Context HttpHeaders headers,
    			@QueryParam(value = "graphOne") String graphOne,
    			@QueryParam(value = "graphTwo") String graphTwo) throws JSONException {
    	//TODO : use URN NS for filtering results
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator();
    	UriRef o1 = new UriRef(graphOne);
		UriRef o2 = new UriRef(graphTwo);
		System.out.println(o1);
		System.out.println(o2);
		boolean finded = false;
    	MGraph mg = null;
    	
    	if (iter.hasNext())
    	{
    		System.out.println("ok");
    	}
    	System.out.println(iter.hasNext());
    	System.out.println(finded);
    	while (iter.hasNext() && !finded){
    		UriRef rf = iter.next();
    		mg = tcManager.getMGraph(rf);
    		
    		Triple tun = new TripleImpl(rf, LHOntology.mappedGraph.getProperty(), o1);
    		Triple tde = new TripleImpl(rf, LHOntology.mappedGraph.getProperty(), o2);
    		
    		Collection<Triple> cl = new ArrayList<Triple>();
    		cl.add(tun);
    		cl.add(tde);
    		
			if(mg.containsAll(cl)){
				finded = true;
			}
			
    	}
    	
    	
    	return okMGraphResponse(headers, mg);
    }
    
    @Deprecated //use getHistory(urns,forgraph) instead
    private MGraph getHistory(String forGraph){
    	return getHistory(new UriRef(forGraph));
    }
    private MGraph getHistory(LHURNNS graphSpace, String forGraph){
    	return getHistory(new UriRef(graphSpace + forGraph));
    };
    
    private MGraph getHistory(UriRef forGraph){
    	Set<UriRef> l = tcManager.listMGraphs();
    	Iterator<UriRef> iter = l.iterator();
		boolean finded = false;
		UriRef graphRef = null;
    	MGraph mg = null;
    	while (iter.hasNext() && !finded){
    		graphRef = iter.next();
    		mg = tcManager.getMGraph(graphRef);
    		
    		Triple tun = new TripleImpl(graphRef, LHOntology.historyOf.getProperty(), forGraph);
    		Triple tde = new TripleImpl(graphRef, Properties.RDF_TYPE, LHOntology.history.getProperty());
    		Collection<Triple> cl = new ArrayList<Triple>();
    		cl.add(tun);
    		cl.add(tde);
    		
			if(mg.containsAll(cl)){
				finded = true;
			}
    	}
    	if(!finded){
    		graphRef = new UriRef(LHbaseURL.lhBaseHistory + UUID.randomUUID().toString());
    		mg = tcManager.createMGraph(graphRef);
        	mg.add(new TripleImpl(graphRef, Properties.RDF_TYPE, LHOntology.history.getProperty()));
        	mg.add(new TripleImpl(graphRef, LHOntology.historyOf.getProperty(), forGraph));
    	}
    	return mg;
    }
    
    //end point for getting history of a graph
    //TODO : move to /graphSpace/history
    @Path("/history")
    @GET
    @Consumes(WILDCARD)
    public Response history(@QueryParam(value = "for") String forgraph,
            @Context HttpHeaders headers){
    	//TODO : use the urnNS enabled getHistory
    	MGraph mg = getHistory(forgraph);
    	
    	return okMGraphResponse(headers, mg);
    }
    
    //end point for commiting changes
    @Path("/changes")
    @POST
    @Consumes(APPLICATION_FORM_URLENCODED)
    public Response changeCommit(@FormParam(value ="change") String jsonConfig, 
    								@Context HttpHeaders headers) throws EngineException, IOException {
        
    	Patch p = new Patch();
    	//TODO : get the parsing format from the headers
    	//TODO : change the name of the variable jsonConfig
    	Graph changeGraph = parser.parse(IOUtils.toInputStream(jsonConfig), "application/rdf+xml");
    	MGraph gToChange = p.apply(changeGraph,tcManager);
    	
    	return okMGraphResponse(headers, gToChange);
    }
    
    @Path("/changes")
    @OPTIONS
    public Response handleCorsPreflightChange(@Context HttpHeaders headers){
        ResponseBuilder res = Response.ok();
        log.error("DANS LE OPTION CHANGE");
        //res.header(CorsHelper.ALLOW_ORIGIN, "*");
        enableCORS(servletContext,res, headers,POST, GET, DELETE, OPTIONS);
        log.error("DANS LE OPTION CHANGE 2");
        return res.build();
    }
    
    @Deprecated
    @Path("/skosdefinition")
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getSkosDefinition(@QueryParam(value = "type") String type, @Context HttpHeaders headers) throws JSONException {
    	
    	JSONObject jo = new JSONObject();
    	JSONArray ja = new JSONArray();
    	
    	if(type.equals("all")){
    		for (SkosEnum e : SkosEnum.values()){
        		ja.put(e.name());
        	}
    	}
    	else if(type.equals("references")){
    		for (SkosReferencesEnum e : SkosReferencesEnum.values()){
        		ja.put(e.name());
        	}
    	}
    	else if(type.equals("properties")){
    		for (SkosPropertiesEnum e : SkosPropertiesEnum.values()){
        		ja.put(e.name());
        	}
    	}
    	else {
    		return Response.status(BAD_REQUEST).build();
    	}
    	
    	jo.put("values", ja);
    	ResponseBuilder rb = Response.ok(jo.toString());
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    @Deprecated //"use the model endpoint instead
    @Path("/skosontology/all")
    @GET
    @Consumes(WILDCARD)
    @Produces(RDF_XML)
    //TODO : change query parameter name from skos to "model"
    //TODO : change endpoint from skosontology to ontologiesmodel
    //TODO : remove the "/all" and remove the /skosontology model
    //TODO : without model parameter, this endpoint provide the list of available ontologies
    //TODO : remove the skos_ prefix in the file name as it not really mean something
    public Response getSkosOnto(@QueryParam(value = "skos") String modelName, @Context HttpHeaders headers) throws JSONException {
    	log.warn("This endpoint is deprecated, use the model endpoint instead");
    	UriRef soURI = new UriRef("urn:x-onto-utils:skosOntology" + modelName);
    	MGraph g;
    	Set<UriRef> l = tcManager.listMGraphs();
    	if(l.contains(soURI)){
    		g = tcManager.getMGraph(soURI);
    	}
    	else{
    		//initialisation, loading of the graph
    		g = tcManager.createMGraph(soURI);
    		g.addAll(parser.parse(this.getClass().getResourceAsStream("/skos_"+modelName+".rdf"), "application/rdf+xml"));
    	}
    	return okMGraphResponse(headers, g);
    }
    
    @Deprecated
    @Path("/skosontology")
    @GET
    @Consumes(WILDCARD)
    @Produces(RDF_XML)
    //TODO : remove this when getSkosOnto is fully okay with new implementation
    public Response getSkosOnto(@Context HttpHeaders headers) throws JSONException {
    	log.warn("This endpoint is deprecated, use the model endpoint instead");
    	return getSkosOnto("default", headers);
    }
    /**
     * Media-Type based handling of the raw POST data.
     * 
     * @param data
     *            binary payload to analyze
     * @param uri
     *            optional URI for the content items (to be used as an identifier in the enhancement graph)
     * @throws EngineException
     *             if the content is somehow corrupted
     * @throws IOException
     */ 
    @POST
    @Consumes(MULTIPART_FORM_DATA)
    public Response skosify(@FormDataParam(value ="conf") String jsonConfig, 
    						@FormDataParam("file") InputStream uploadedInputStream,
    						@FormDataParam("file") FormDataContentDisposition fileDetail,
    						//FormParam(value = "file") @DefaultValue("$null$") String f,
    						@Context HttpHeaders headers) throws EngineException, IOException {
    	log.debug("Call skosification endpoint");
    	String f = IOUtils.toString(uploadedInputStream);
        
        if(f.equals("")) f = null;
        //workaround as we can't pass null to @DefaultValue
        if(f.equals("$null$")) f = null;
        
        return skosification(null, headers, jsonConfig, f, false);
    }

    protected Response skosification(String format,
                                               HttpHeaders headers,
                                               String jsonConfig,
                                               String data,
                                               boolean buildAjaxview) throws EngineException, IOException{
    	
    	InputStream inputStream = null;
    	if(data != null) inputStream = IOUtils.toInputStream(data);
    	
		Skosifier s;
		try {
			//metadata generation
			JSONObject jo = new JSONObject(jsonConfig);
			MGraph metadata = MetadataGenerator.generate(jo);
			
			//skosification
			s = SkosifierFactoryImpl.getSkosifierImpl(inputStream, jsonConfig);
			//TODO : change skosifier api to : constructor(), and .skosify(inputStream,JsonOBJECT);
			MGraph graph = s.skosify();
			
		} catch (JSONException e) {
			throw new WebApplicationException(e, BAD_REQUEST);
		}
    	
    	UriRef thRef = s.getDereferencableGraphName();
		
    	if(broadcast != null) broadcast.broadcast(Broadcaster.THESAURUS, thRef);
    	
    	ResponseBuilder rb = Response.ok("<a rel='job' href='"+thRef.getUnicodeString()+"'>Browse your thesaurus</a>").type("text/xml");
    	addCORSOrigin(servletContext,rb, headers);
    	return rb.build();
    }
    
    private Response okMGraphResponse(HttpHeaders headers, MGraph graph){
    	return okGraphResponse(headers, graph.getGraph());
    }
    
    private Response okGraphResponse(HttpHeaders headers, Graph graph){
    	ResponseBuilder rb = Response.ok(graph);
        if (headers.getAcceptableMediaTypes().isEmpty()) {
            // use RDF/XML as default format to keep compat with OpenCalaisclients
            System.out.println("NO ACCEPTABLE MEDIA TYPE");
            rb.header(HttpHeaders.CONTENT_TYPE, RDF_XML+"; charset=UTF-8");
           
        }
        log.error("je passe bien ici allow bien");
        //rb.header("Access-Control-Allow-Headers", "Authorization");
        //rb.header("Access-Control-Allow-Origin", "*");
        enableCORS(servletContext,rb, headers);
        //addCORSOrigin(servletContext,rb, headers);
        return rb.build();
    }
    
    /**
     * 
     * @param searchTerm : the term to search
     * @param searchFields : the fields where to search
     * @param resultFields : a list of ldpath instructions that return the context around finded entities
     * @param headers
     * @return
     */
    @Path("/search")
    @GET
    @Consumes( {MediaType.APPLICATION_JSON})
    public Response queryEntities(@QueryParam(value="q") String searchTerm,
    							  @QueryParam(value="sf") List<String> searchFields,
    							  @QueryParam(value="rf") List<String> resultFields,
    							  //TODO : add a paramter for languages
                                  @Context HttpHeaders headers) {
    	 Collection<String> supported = new HashSet<String>(JerseyUtils.QUERY_RESULT_SUPPORTED_MEDIA_TYPES);
         supported.add(TEXT_HTML);
         final MediaType acceptedMediaType = getAcceptableMediaType(
             headers, supported, MediaType.APPLICATION_JSON_TYPE);
         
        NamespacePrefixService nsPrefixService;

    	nsPrefixService = ContextHelper.getServiceFromContext(NamespacePrefixService.class, servletContext);
    	SiteManager manager = ContextHelper.getServiceFromContext(SiteManager.class, servletContext);
    	
    	
    	String ldpath = generateLDpath(searchFields,resultFields, nsPrefixService);
    	
    	//List of searched lang
        //TODO : put this configuration in the request (use Jersey collection utility)
        String[] languages = null;
    	
        //create a new query for each field in the searchFields collection
        List<FieldQuery> queries = new ArrayList<FieldQuery>();
        for(String searchField : searchFields){
        	System.out.println(searchField);
        	if(! URLDecoder.decode(searchField).startsWith("http:")) searchField = nsPrefixService.getFullName(searchField);
        	
        	FieldQuery query = new LDPathFieldQueryImpl();
            ((LDPathFieldQueryImpl)query).setLDPathSelect(ldpath);
            query.setConstraint(searchField, new TextConstraint(searchTerm.trim(), PatternType.wildcard, false, languages));
            queries.add(query);
        }
        
        QueryResultList<Representation> result;
        
        
        	
        	List<Representation> resultList = new ArrayList<Representation>();
        	for(FieldQuery q : queries){
        		try{
        			
        			QueryResultList<Representation> queryResult = executeLDPathQuery(manager,q, ((LDPathSelect)q).getLDPathSelect());
        			resultList.addAll(queryResult.results());
        			
        		} catch (LDPathParseException e) {
                    log.warn("Unable to parse LDPath program used as select for Query:");
                    log.warn("FieldQuery: \n {}",q);
                    log.warn("LDPath: \n {}",((LDPathSelect)q).getLDPathSelect());
                    log.warn("Exception:",e);
                    return Response.status(Status.BAD_REQUEST)
                    .entity(("Unable to parse LDPath program (Messages: "+
                            getLDPathParseExceptionMessage(e)+")!\n"))
                    .build();
                } catch (IllegalStateException e) {
                    log.warn("parsed LDPath program is not compatible with parsed Query!",e);
                    return Response.status(Status.BAD_REQUEST)
                    .entity(e.getMessage())
                    .build();
                } catch (EntityhubException e) {
                    String message = String.format("Exception while performing the " +
                        "FieldQuery on the EntityHub (message: %s)", e.getMessage());
                    log.error(message, e);
                    return Response.status(Status.INTERNAL_SERVER_ERROR)
                    .entity(message)
                    .build();
                }	
        	}
        	
    	//little hack to get this serialized easily and be able to merge multiples queries
    	FieldQuery hackyQuery = new FieldQueryImpl();
    	result= new QueryResultListImpl<Representation>(hackyQuery, resultList, Representation.class);
        	
        
        ResponseBuilder rb = Response.ok(result)
        		.header(HttpHeaders.CONTENT_TYPE, acceptedMediaType+"; charset=utf-8");
        addCORSOrigin(servletContext, rb, headers);
        return rb.build(); 
    }
    
    private String generateLDpath(List<String> searchFields, List<String> resultFields, NamespacePrefixService nsPrefixService) {
    	String result = "";
    	//first add searched field to result values
    	for(String sf : searchFields){
    		sf = URLDecoder.decode(sf);
    		if(! sf.startsWith("http:")) sf = nsPrefixService.getFullName(sf);
    		result += "<" + sf + "> = <" + sf + ">; \n";
    	}
    	//then we simply add the list of ldpath resultFields
    	for(String rf : resultFields){
    		result += URLDecoder.decode(rf) + "\n";
    	}
		return result;
	}

	/**
     * Execute a Query that uses LDPath to process results.
     * @param query the query
     * @param mediaType the mediaType for the response
     * @param headers the http headers of the request
     * @return the response
     * @throws LDPathParseException 
     * @throws IllegalArgumentException 
     * @throws YardException 
     */
    private QueryResultList<Representation> executeLDPathQuery(SiteManager manager,FieldQuery query, String ldpathProgramString) throws LDPathParseException, YardException, IllegalArgumentException {
        QueryResultList<Representation> result;
        ValueFactory vf = new RdfValueFactory(new IndexedMGraph());
        SiteManagerBackend backend = new SiteManagerBackend(manager);
        EntityhubLDPath ldPath = new EntityhubLDPath(backend,vf);
        //copy the selected fields, because we might need to delete some during
        //the preparation phase
        Set<String> selectedFields = new HashSet<String>(query.getSelectedFields());
        //first prepare (only execute the query if the parameters are valid)
        Program<Object> program;
        program = prepareQueryLDPathProgram(ldpathProgramString, selectedFields, backend, ldPath);
        
        //2. execute the query
        //Execute the query against EntityHub
//        Iterator<Representation> resultIt;
//        // go directly to the yard and query there for Representations
//        resultIt = entityhub.getYard().findRepresentation(query).iterator();
        //Execute the query against manager
        Iterator<Representation> resultIt = new AdaptingIterator<Entity,Representation>(manager.findEntities(query).iterator(),
                new AdaptingIterator.Adapter<Entity,Representation>() {
                    @Override
                    public Representation adapt(Entity value, Class<Representation> type) {
                        return value.getRepresentation();
                    }},Representation.class);
        
        //process the results
        Collection<Representation> transformedResults = transformQueryResults(resultIt, program,
            selectedFields, ldPath, backend, vf);
        result = new QueryResultListImpl<Representation>(query, transformedResults, Representation.class);
        
        return result;
    }
}
