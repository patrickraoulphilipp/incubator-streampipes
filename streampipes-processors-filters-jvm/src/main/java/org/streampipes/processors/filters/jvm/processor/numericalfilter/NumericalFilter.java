/*
 * Copyright 2017 FZI Forschungszentrum Informatik
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
 */

package org.streampipes.processors.filters.jvm.processor.numericalfilter;

import org.streampipes.model.runtime.Event;
import org.streampipes.wrapper.context.RuntimeContext;
import org.streampipes.wrapper.routing.SpOutputCollector;
import org.streampipes.wrapper.runtime.EventProcessor;

public class NumericalFilter implements EventProcessor<NumericalFilterParameters> {

  private NumericalFilterParameters params;

  @Override
  public void onInvocation(NumericalFilterParameters numericalFilterParameters, RuntimeContext
          runtimeContext) {
    this.params = numericalFilterParameters;
  }

  @Override
  public void onEvent(Event event, SpOutputCollector out) {
    Boolean satisfiesFilter = false;

    Double value = event.getFieldBySelector(params.getFilterProperty()).getAsPrimitive()
            .getAsDouble();

    //Double value = Double.parseDouble(String.valueOf(in.get(params.getFilterProperty())));
    Double threshold = params.getThreshold();

    if (params.getNumericalOperator() == NumericalOperator.EQ) {
      satisfiesFilter = (value == threshold);
    } else if (params.getNumericalOperator() == NumericalOperator.GE) {
      satisfiesFilter = (value >= threshold);
    } else if (params.getNumericalOperator() == NumericalOperator.GT) {
      satisfiesFilter = value > threshold;
    } else if (params.getNumericalOperator() == NumericalOperator.LE) {
      satisfiesFilter = (value <= threshold);
    } else if (params.getNumericalOperator() == NumericalOperator.LT) {
      satisfiesFilter = (value < threshold);
    }

    if (satisfiesFilter) {
      out.collect(event);
    }
  }

  @Override
  public void onDetach() {

  }
}
