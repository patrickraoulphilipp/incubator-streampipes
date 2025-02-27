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

import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import {
    PipelineService,
    DataProcessorInvocation,
    DataSinkInvocation,
    EventSchema,
    Pipeline
} from '@streampipes/platform-services';
import { PipelineElementUnion } from '../../../editor/model/editor.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
    selector: 'quick-edit',
    templateUrl: './quickedit.component.html',
})
export class QuickEditComponent implements OnInit, AfterViewInit {

    @Input()
    pipeline: Pipeline;

    @Output()
    reloadPipelineEmitter: EventEmitter<void> = new EventEmitter<void>();

    _selectedElement: PipelineElementUnion;

    eventSchemas: EventSchema[];

    parentForm: FormGroup;
    formValid: boolean;
    viewInitialized = false;

    isInvocable = false;
    isDataProcessor = false;

    pipelineUpdating = false;

    constructor(private pipelineService: PipelineService,
                private fb: FormBuilder,
                private changeDetectorRef: ChangeDetectorRef) {

    }

    ngOnInit() {
        this.parentForm = this.fb.group({
        });

        this.parentForm.statusChanges.subscribe((status) => {
            this.formValid = this.viewInitialized && this.parentForm.valid;
        });
    }

    ngAfterViewInit(): void {
        this.viewInitialized = true;
        this.formValid = this.viewInitialized && this.parentForm.valid;
        this.changeDetectorRef.detectChanges();
    }

    updatePipeline() {
        this.pipelineUpdating = true;
        this.updatePipelineElement();
        this.pipelineService.updatePipeline(this.pipeline).subscribe(data => {
            this.reloadPipelineEmitter.emit();
            this.pipelineUpdating = false;
        });
    }

    updatePipelineElement() {
        if (this._selectedElement instanceof DataProcessorInvocation) {
            this.updateDataProcessor();
        } else if (this._selectedElement instanceof DataSinkInvocation) {
            this.updateDataSink();
        }
    }

    updateDataProcessor() {
        const dataProcessors: DataProcessorInvocation[] = [];
        this.pipeline.sepas.forEach(p => {
           if (p.dom === this._selectedElement.dom) {
               dataProcessors.push(this._selectedElement as DataProcessorInvocation);
           } else {
                dataProcessors.push(p);
           }
        });
        this.pipeline.sepas = dataProcessors;
    }

    updateDataSink() {
        const dataSinks: DataSinkInvocation[] = [];
        this.pipeline.actions.forEach(p => {
            if (p.dom === this._selectedElement.dom) {
                dataSinks.push(this._selectedElement as DataSinkInvocation);
            } else {
                dataSinks.push(p);
            }
        });
        this.pipeline.actions = dataSinks;
    }

    get selectedElement() {
        return this._selectedElement;
    }

    @Input()
    set selectedElement(selectedElement: PipelineElementUnion) {
        if (this._selectedElement) {
            this.updatePipelineElement();
        }
        this._selectedElement = selectedElement;
        this.eventSchemas = [];
        if (this._selectedElement instanceof DataProcessorInvocation || this._selectedElement instanceof DataSinkInvocation) {
            (this._selectedElement as any).inputStreams.forEach(is => {
                this.eventSchemas = this.eventSchemas.concat(is.eventSchema);
            });
        }
        this.updateTypeInfo();
    }

    updateTypeInfo() {
        this.isDataProcessor = this._selectedElement instanceof DataProcessorInvocation;
        this.isInvocable = this._selectedElement instanceof DataProcessorInvocation ||
            this._selectedElement instanceof DataSinkInvocation;
    }
}

