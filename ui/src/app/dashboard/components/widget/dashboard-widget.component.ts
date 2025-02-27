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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AddVisualizationDialogComponent } from '../../dialogs/add-widget/add-visualization-dialog.component';
import {
  DashboardItem,
  DashboardService,
  DashboardWidgetModel,
  DataLakeMeasure, DatalakeRestService,
  DataViewDataExplorerService,
  Pipeline,
  PipelineService
} from '@streampipes/platform-services';
import { DialogService, PanelType } from '@streampipes/shared-ui';
import { EditModeService } from '../../services/edit-mode.service';
import { ReloadPipelineService } from '../../services/reload-pipeline.service';
import { zip } from 'rxjs';

@Component({
  selector: 'dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.css']
})
export class DashboardWidgetComponent implements OnInit {

  @Input() widget: DashboardItem;
  @Input() editMode: boolean;
  @Input() headerVisible = false;
  @Input() itemWidth: number;
  @Input() itemHeight: number;

  @Output() deleteCallback: EventEmitter<DashboardItem> = new EventEmitter<DashboardItem>();
  @Output() updateCallback: EventEmitter<DashboardWidgetModel> = new EventEmitter<DashboardWidgetModel>();

  widgetLoaded = false;
  configuredWidget: DashboardWidgetModel;
  widgetDataConfig: DataLakeMeasure;
  pipeline: Pipeline;

  pipelineRunning = false;
  widgetNotAvailable = false;

  constructor(private dashboardService: DashboardService,
              private dialogService: DialogService,
              private pipelineService: PipelineService,
              private editModeService: EditModeService,
              private reloadPipelineService: ReloadPipelineService,
              private dataExplorerService: DataViewDataExplorerService,
              private dataLakeRestService: DatalakeRestService) {
  }

  ngOnInit(): void {
    this.loadWidget();
    this.reloadPipelineService.reloadPipelineSubject.subscribe(() => {
      this.loadWidget();
    });
  }

  loadWidget() {
    this.dashboardService.getWidget(this.widget.id).subscribe(response => {
      this.configuredWidget = response;
      this.loadVisualizablePipeline();
    });
  }

  loadVisualizablePipeline() {
    zip(this.dataExplorerService.getPersistedDataStream(this.configuredWidget.pipelineId, this.configuredWidget.visualizationName), this.dataLakeRestService.getAllMeasurementSeries())
      .subscribe(res => {
        const vizPipeline = res[0];
        const measurement = res[1].find(m => m.measureName === vizPipeline.measureName);
        vizPipeline.eventSchema = measurement.eventSchema;
      this.widgetDataConfig = vizPipeline;
      this.dashboardService.getPipelineById(vizPipeline.pipelineId).subscribe(pipeline => {
        this.pipeline = pipeline;
        this.pipelineRunning = pipeline.running;
        this.widgetNotAvailable = false;
        this.widgetLoaded = true;
      });
    }, err => {
      this.widgetLoaded = true;
      this.widgetNotAvailable = true;
    });
  }

  removeWidget() {
    this.deleteCallback.emit(this.widget);
  }

  startPipeline() {
    if (!this.pipelineRunning) {
      this.pipelineService
          .startPipeline(this.pipeline._id)
          .subscribe(status => {
            // this.loadWidget();
            this.reloadPipelineService.reloadPipelineSubject.next();
          });
    }
  }

  modifyWidget() {
    this.editModeService.notify(true);
    this.editWidget();
  }

  editWidget(): void {
    const dialogRef = this.dialogService.open(AddVisualizationDialogComponent, {
      panelType: PanelType.SLIDE_IN_PANEL,
      title: 'Edit widget',
      width: '50vw',
      data: {
        'widget': this.configuredWidget,
        'pipeline': this.widgetDataConfig,
        'editMode': true,
        'startPage': this.widgetNotAvailable ? 'select-pipeline' : 'configure-widget'
      }
    });

    dialogRef.afterClosed().subscribe(widget => {
      if (widget) {
        this.configuredWidget = widget;
        this.loadVisualizablePipeline();
        this.updateCallback.emit(this.configuredWidget);
      }
    });
  }
}
