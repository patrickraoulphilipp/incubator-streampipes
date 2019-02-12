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

package org.streampipes.processors.aggregation.flink.processor.aggregation;

import org.apache.flink.api.java.functions.KeySelector;
import org.apache.flink.streaming.api.TimeCharacteristic;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.windowing.assigners.SlidingEventTimeWindows;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.streampipes.model.runtime.Event;
import org.streampipes.processors.aggregation.flink.AbstractAggregationProgram;

import java.util.Map;

public class AggregationProgram extends AbstractAggregationProgram<AggregationParameters> {

  public AggregationProgram(AggregationParameters params, boolean debug) {
    super(params, debug);
    setStreamTimeCharacteristic(TimeCharacteristic.IngestionTime);
  }

  @Override
  protected DataStream<Event> getApplicationLogic(DataStream<Event>... dataStreams) {
    return getKeyedStream(dataStreams[0]);
  }

  private DataStream<Event> getKeyedStream(DataStream<Event> dataStream) {
    if (params.getGroupBy().size() > 0) {
      return dataStream
              .keyBy(getKeySelector())
              .window(SlidingEventTimeWindows.of(Time.seconds(params.getTimeWindowSize()), Time.seconds(params.getOutputEvery())))
              .apply(new Aggregation(params.getAggregationType(), params.getAggregate(), params.getGroupBy().get(0)));
    } else {
      return dataStream.timeWindowAll(Time.seconds(params.getTimeWindowSize()), Time.seconds(params.getOutputEvery()))
              .apply(new Aggregation(params.getAggregationType(), params.getAggregate()));
    }
  }

  private KeySelector<Event, String> getKeySelector() {
    // TODO allow multiple keys
    String groupBy = params.getGroupBy().get(0);
    return new KeySelector<Event, String>() {
      @Override
      public String getKey(Event in) throws Exception {
        return String.valueOf(in.getFieldBySelector(groupBy));
      }
    };
  }
}
