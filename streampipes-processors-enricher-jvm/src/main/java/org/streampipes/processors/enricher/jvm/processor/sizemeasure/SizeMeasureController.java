/*
Copyright 2019 FZI Forschungszentrum Informatik

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package org.streampipes.processors.enricher.jvm.processor.sizemeasure;

import org.streampipes.model.DataProcessorType;
import org.streampipes.model.graph.DataProcessorDescription;
import org.streampipes.model.graph.DataProcessorInvocation;
import org.streampipes.sdk.builder.ProcessingElementBuilder;
import org.streampipes.sdk.builder.StreamRequirementsBuilder;
import org.streampipes.sdk.extractor.ProcessingElementParameterExtractor;
import org.streampipes.sdk.helpers.*;
import org.streampipes.sdk.utils.Assets;
import org.streampipes.wrapper.standalone.ConfiguredEventProcessor;
import org.streampipes.wrapper.standalone.declarer.StandaloneEventProcessingDeclarer;

public class SizeMeasureController extends StandaloneEventProcessingDeclarer<SizeMeasureParameters> {

  private static final String SIZE_UNIT = "sizeUnit";
  final static String BYTE_SIZE = "BYTE";
  final static String KILOBYTE_SIZE = "KILOBYTE";
  final static String MEGABYTE_SIZE = "MEGABYTE";

  final static String EVENT_SIZE = "eventSize";

  @Override
  public DataProcessorDescription declareModel() {
    return ProcessingElementBuilder.create("org.streampipes.processors.enricher.jvm.sizemeasure")
            .category(DataProcessorType.ENRICH)
            .withAssets(Assets.DOCUMENTATION, Assets.ICON)
            .withLocales(Locales.EN)
            .requiredStream(StreamRequirementsBuilder
                    .create()
                    .requiredProperty(EpRequirements.anyProperty())
                    .build())
            .requiredSingleValueSelection(Labels.withId(SIZE_UNIT),
                    Options.from(new Tuple2<>("Bytes", BYTE_SIZE),
                            new Tuple2<>("Kilobytes (1024 Bytes)", KILOBYTE_SIZE),
                            new Tuple2<>("Megabytes (1024 Kilobytes)", MEGABYTE_SIZE)))
            .outputStrategy(OutputStrategies.append(EpProperties.doubleEp(
                    Labels.withId(EVENT_SIZE),
                    EVENT_SIZE,
                    "http://schema.org/contentSize")))
            .build();
  }

  @Override
  public ConfiguredEventProcessor<SizeMeasureParameters>
  onInvocation(DataProcessorInvocation graph, ProcessingElementParameterExtractor extractor) {

    String sizeUnit = extractor.selectedSingleValueInternalName(SIZE_UNIT, String.class);
    SizeMeasureParameters staticParam = new SizeMeasureParameters(graph, sizeUnit);

    return new ConfiguredEventProcessor<>(staticParam, SizeMeasure::new);
  }
}
