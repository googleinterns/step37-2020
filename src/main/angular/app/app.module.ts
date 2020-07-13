import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {GoogleChartsModule} from 'angular-google-charts';

import {AppRoutingModule} from './app_routing.module';
import {AppComponent} from './app.component';
import {GraphComponent} from './graph/graph.component';
import {ProjectSelectComponent} from './project_select/project_select.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {DateUtilitiesService} from './services/date_utilities.service';
import {GraphProcessorService} from './services/graph_processor.service';
import {dataServiceProvider} from './services/data.service.provider';

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
  providers: [dataServiceProvider, DateUtilitiesService, GraphProcessorService],
  bootstrap: [AppComponent],
})
export class AppModule {}
