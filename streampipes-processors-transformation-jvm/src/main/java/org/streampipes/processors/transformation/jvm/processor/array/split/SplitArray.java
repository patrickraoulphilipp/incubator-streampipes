/*
 * Copyright 2018 FZI Forschungszentrum Informatik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package org.streampipes.processors.transformation.jvm.processor.array.split;

import org.streampipes.logging.api.Logger;
import org.streampipes.model.runtime.Event;
import org.streampipes.model.runtime.EventFactory;
import org.streampipes.wrapper.context.RuntimeContext;
import org.streampipes.wrapper.routing.SpOutputCollector;
import org.streampipes.wrapper.runtime.EventProcessor;

import java.util.List;
import java.util.Map;

public class SplitArray implements EventProcessor<SplitArrayParameters> {

    private static Logger LOG;

    private SplitArrayParameters splitArrayParameters;


    @Override
    public void onInvocation(SplitArrayParameters splitArrayParameters, RuntimeContext runtimeContext) {
        LOG = splitArrayParameters.getGraph().getLogger(SplitArray.class);
        this.splitArrayParameters = splitArrayParameters;
    }

    @Override
    public void onEvent(Event inputEvent, SpOutputCollector out) {
        String arrayField  = splitArrayParameters.getArrayField();
        List<String> keepProperties = splitArrayParameters.getKeepProperties();

        List<Map<String, Object>> allEvents = inputEvent.getFieldBySelector(arrayField).getAsList()
                .parseAsCustomType(value -> (Map<String, Object>) value);


        for (Map<String, Object> event : allEvents) {
            // TODO check null
            Event outEvent = EventFactory.fromMap(event);
            for (String propertyName : keepProperties) {
                outEvent.addField(inputEvent.getFieldBySelector(propertyName));
            }

            out.collect(outEvent);
        }

    }

    @Override
    public void onDetach() {
    }
}
