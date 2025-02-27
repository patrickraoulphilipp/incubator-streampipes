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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseNavigationComponent } from '../base-navigation.component';
import { Router } from '@angular/router';
import { NotificationCountService } from '../../../services/notification-count-service';
import { AuthService } from '../../../services/auth.service';
import { Subscription, timer } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import { RestApi } from '../../../services/rest-api.service';
import { AppConstants } from '../../../services/app.constants';

@Component({
  selector: 'iconbar',
  templateUrl: './iconbar.component.html',
  styleUrls: ['./iconbar.component.scss']
})
export class IconbarComponent extends BaseNavigationComponent implements OnInit, OnDestroy {

  unreadNotificationCount = 0;
  unreadNotificationsSubscription: Subscription;

  constructor(router: Router,
              authService: AuthService,
              public notificationCountService: NotificationCountService,
              private restApi: RestApi,
              appConstants: AppConstants) {
    super(authService, router, appConstants);
  }

  ngOnInit(): void {
    super.onInit();
    this.unreadNotificationsSubscription = timer(0, 10000).pipe(
      exhaustMap(() => this.restApi.getUnreadNotificationsCount()))
      .subscribe(response => {
        this.notificationCountService.unreadNotificationCount$.next(response.count);
      });

    this.notificationCountService.unreadNotificationCount$.subscribe(count => {
      this.unreadNotificationCount = count;
    });
  }

  ngOnDestroy() {
    this.unreadNotificationsSubscription.unsubscribe();
  }
}
