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

import { ConnectUtils } from '../../support/utils/ConnectUtils';
import { PipelineUtils } from '../../support/utils/PipelineUtils';
import { PipelineElementBuilder } from '../../support/builder/PipelineElementBuilder';
import { PipelineBuilder } from '../../support/builder/PipelineBuilder';
import { DashboardUtils } from '../../support/utils/DashboardUtils';

const adapterName = 'simulator';


describe('Test live dashboard', () => {
  beforeEach('Setup Test', () => {
    cy.initStreamPipesTest();
    ConnectUtils.addMachineDataSimulator(adapterName);
  });

  it('Perform Test', () => {
    const pipelineName = 'DashboardPipeline';
    const pipelineInput = PipelineBuilder.create(pipelineName)
      .addSource(adapterName)
      .addSink(
        PipelineElementBuilder.create('data_lake')
          .addInput('input', 'db_measurement', 'demo')
          .build())
      .build();

    PipelineUtils.testPipeline(pipelineInput);

    DashboardUtils.goToDashboard();

    // Add new dashboard
    const dashboardName = 'testDashboard';
    DashboardUtils.addAndEditDashboard(dashboardName);

    DashboardUtils.addWidget(pipelineName, 'raw');

    // Validate that data is coming (at least 3 events)
    DashboardUtils.validateRawWidgetEvents(3);

  });
});

