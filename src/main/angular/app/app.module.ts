import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {GoogleChartsModule} from 'angular-google-charts';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GraphComponent} from './graph/graph.component';
import {ProjectSelectComponent} from './project-select/project-select.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FakeDataService} from './fake-data.service';
import {HttpClientModule} from '@angular/common/http';
import {DateUtilitiesService} from './date-utilities.service';
import {GraphProcessorService} from './graph-processor.service';

@NgModule({
  declarations: [AppComponent, GraphComponent, ProjectSelectComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleChartsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [FakeDataService, DateUtilitiesService, GraphProcessorService],
  bootstrap: [AppComponent],
})
export class AppModule {}
