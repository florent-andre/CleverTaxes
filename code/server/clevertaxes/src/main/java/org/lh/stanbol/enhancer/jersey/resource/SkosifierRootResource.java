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

import static javax.ws.rs.core.MediaType.WILDCARD;

import java.io.StringWriter;
import java.io.Writer;
//import static org.apache.stanbol.commons.web.base.CorsHelper;
import static org.apache.stanbol.commons.web.base.CorsHelper.addCORSOrigin;
import static org.apache.stanbol.commons.web.base.CorsHelper.enableCORS;
import javax.servlet.ServletContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.Encoded;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.xml.bind.JAXBException;

import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.serializedform.Parser;
import org.apache.clerezza.rdf.core.serializedform.Serializer;
import org.apache.stanbol.commons.web.base.ContextHelper;

import org.apache.stanbol.commons.web.base.resource.BaseStanbolResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import eu.ooffee.cleverTaxes.business.UserManager;
import eu.ooffee.cleverTaxes.model.User;
import eu.ooffee.cleverTaxes.model.UsersList;
import eu.ooffee.utilities.jaxb.JaxbSimple;
import eu.ooffee.utilities.jaxb.JaxbSimpleException;
import eu.ooffee.utilities.jaxb.MarshalServicer;


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
    
    protected TcManager tcManager;

    protected Serializer serializer;
    
    protected Parser parser;
    
    public SkosifierRootResource(@Context ServletContext context) {
        tcManager = ContextHelper.getServiceFromContext(TcManager.class, context);
        serializer = ContextHelper.getServiceFromContext(Serializer.class, context);
        parser = ContextHelper.getServiceFromContext(Parser.class, context);
    }
    
    @OPTIONS
    public Response handleCorsPreflight(@Context HttpHeaders headers){
        ResponseBuilder res = Response.ok();
        log.error("DANS LE OPTION 0");
        enableCORS(servletContext,res, headers);
        return res.build();
    }
    
    
    @GET
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response getGraph(@QueryParam(value = "uri") String uri,
                                    @Context HttpHeaders headers){
    	ResponseBuilder res = Response.ok("YOYOOYY");
        addCORSOrigin(servletContext,res, headers);
        return res.build();
    }
    
    @GET
    @Path("/createUser")
    @Consumes(WILDCARD)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser(@QueryParam(value="name") String name,
    							@QueryParam(value="taxAmount") double taxAmount,
    							@Context HttpHeaders headers) throws JAXBException, JaxbSimpleException{
    	
    	User user = new User(name, taxAmount);
    	UsersList userlist = UserManager.getUsers();
    	userlist.addUser(user);
    	
//    	Writer sw = new StringWriter();
//    	MarshalServicer.getMarshaller().marshal(user, sw);
    	
    	JaxbSimple.serialise(user, System.out);
    	
//    	ResponseBuilder res = Response.ok(sw.toString());
    	ResponseBuilder res = Response.ok("test, remettre une serial string quand ok".toString());
        addCORSOrigin(servletContext,res, headers);
        return res.build();
    	
    }
    
}
