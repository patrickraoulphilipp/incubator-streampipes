/*
 *   Licensed to the Apache Software Foundation (ASF) under one or more
 *   contributor license agreements.  See the NOTICE file distributed with
 *   this work for additional information regarding copyright ownership.
 *   The ASF licenses this file to You under the Apache License, Version 2.0
 *   (the "License"); you may not use this file except in compliance with
 *   the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { BaseStreamPipesWidget } from "../base/base-widget";
import { StaticPropertyExtractor } from "../../../sdk/extractor/static-property-extractor";
import { ResizeService } from "../../../services/resize.service";
import { DatalakeRestService } from '@streampipes/platform-services';
import { WidgetConfigBuilder } from "../../../registry/widget-config-builder";

@Component({
    selector: 'raw-widget',
    templateUrl: './raw-widget.component.html',
    styleUrls: ['./raw-widget.component.css']
})
export class RawWidgetComponent extends BaseStreamPipesWidget implements OnInit, OnDestroy {

    items: Array<string>;
    width: number;
    height: number;

    constructor(dataLakeService: DatalakeRestService, resizeService: ResizeService) {
        super(dataLakeService, resizeService, false);
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.width = this.computeCurrentWidth(this.itemWidth);
        this.height = this.computeCurrentHeight(this.itemHeight);
        this.items = [];
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    extractConfig(extractor: StaticPropertyExtractor) {

    }

    protected onEvent(events: any[]) {
        this.items = events.map(ev => JSON.stringify(ev)).reverse();
    }

    protected onSizeChanged(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    protected getQueryLimit(extractor: StaticPropertyExtractor): number {
        return extractor.integerParameter(WidgetConfigBuilder.QUERY_LIMIT_KEY);
    }

}
