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

import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseNavigationComponent } from '../base-navigation.component';
import { Router } from '@angular/router';
import { RestApi } from '../../../services/rest-api.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { FormControl } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ProfileService } from '../../../profile/profile.service';
import { VersionInfo } from '../../../info/versions/service/version-info.model';
import { AuthService } from '../../../services/auth.service';
import { AppConstants } from '../../../services/app.constants';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends BaseNavigationComponent implements OnInit {

  @ViewChild('feedbackOpen') feedbackOpen: MatMenuTrigger;
  @ViewChild('accountMenuOpen') accountMenuOpen: MatMenuTrigger;

  userEmail;
  versionInfo: VersionInfo;
  darkMode: boolean;

  appearanceControl: FormControl;

  constructor(router: Router,
              private profileService: ProfileService,
              private restApi: RestApi,
              private overlay: OverlayContainer,
              authService: AuthService,
              appConstants: AppConstants) {
    super(authService, router, appConstants);
  }

  ngOnInit(): void {
    this.getVersion();
    this.authService.user$.subscribe(user => {
      this.userEmail = user.displayName;
      this.profileService.getUserProfile(user.username).subscribe(userInfo => {
        this.darkMode = this.authService.darkMode$.getValue();
        this.modifyAppearance(userInfo.darkMode);
      });
    });

    this.appearanceControl = new FormControl(this.authService.darkMode$.getValue());
    this.appearanceControl.valueChanges.subscribe(darkMode => {
      this.authService.darkMode$.next(darkMode);
      this.modifyAppearance(darkMode);
    });
    super.onInit();
  }

  modifyAppearance(darkMode: boolean) {
    if (darkMode) {
      this.overlay.getContainerElement().classList.remove('light-mode');
      this.overlay.getContainerElement().classList.add('dark-mode');
    } else {
      this.overlay.getContainerElement().classList.remove('dark-mode');
      this.overlay.getContainerElement().classList.add('light-mode');
    }
  }

  closeFeedbackWindow() {
    // this.feedbackOpen = false;
    this.feedbackOpen.closeMenu();
  }

  openDocumentation() {
    window.open('https://streampipes.apache.org/docs', '_blank');
  }

  openInfo() {
    this.router.navigate(['info']);
    this.activePage = 'Info';
  }

  openProfile() {
    this.router.navigate(['profile']);
    this.activePage = 'Profile';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  getVersion() {
    this.restApi.getVersionInfo().subscribe((response) => {
      this.versionInfo = response as VersionInfo;
    });
  }

}
