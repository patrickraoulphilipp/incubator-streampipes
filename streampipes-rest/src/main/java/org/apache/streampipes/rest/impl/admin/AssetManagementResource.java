/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.apache.streampipes.rest.impl.admin;

import org.apache.streampipes.rest.core.base.impl.AbstractAuthGuardedRestResource;
import org.apache.streampipes.rest.security.AuthConstants;
import org.apache.streampipes.storage.api.IGenericStorage;
import org.apache.streampipes.storage.management.StorageDispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.List;
import java.util.Map;


@Path("/v2/assets")
@Component
@PreAuthorize(AuthConstants.IS_ADMIN_ROLE)
public class AssetManagementResource extends AbstractAuthGuardedRestResource {

  private static final Logger LOG = LoggerFactory.getLogger(AssetManagementResource.class);

  private static final String APP_DOC_TYPE = "asset-management";

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAll() {
    try {
      List<Map<String, Object>> assets = getGenericStorage().findAll(APP_DOC_TYPE);
      return ok(assets);
    } catch (IOException e) {
      LOG.error("Could not connect to storage", e);
      return fail();
    }
  }

  @POST
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response create(String asset) {
    try {
      Map<String, Object> obj = getGenericStorage().create(asset);
      return ok(obj);
    } catch (IOException e) {
      LOG.error("Could not connect to storage", e);
      return fail();
    }
  }

  @GET
  @Path("/{id}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response getCategory(@PathParam("id") String assetId) {
    try {
      Map<String, Object> obj = getGenericStorage().findOne(assetId);
      return ok(obj);
    } catch (IOException e) {
      LOG.error("Could not connect to storage", e);
      return fail();
    }
  }

  @PUT
  @Path("/{id}")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response update(@PathParam("id") String assetId, String asset) {
    try {
      Map<String, Object> obj = getGenericStorage().update(assetId, asset);
      return ok(obj);
    } catch (IOException e) {
      LOG.error("Could not connect to storage", e);
      return fail();
    }
  }

  @DELETE
  @Path("/{id}/{rev}")
  @Produces(MediaType.APPLICATION_JSON)
  public Response delete(@PathParam("id") String assetId, @PathParam("rev") String rev) {
    try {
      getGenericStorage().delete(assetId, rev);
      return ok();
    } catch (IOException e) {
      LOG.error("Could not connect to storage", e);
      return fail();
    }
  }

  private IGenericStorage getGenericStorage() {
    return StorageDispatcher.INSTANCE.getNoSqlStore().getGenericStorage();
  }


}
