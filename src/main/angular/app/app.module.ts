import {BrowserModule} from '@angular/platform-browser';
import {NgModule, ErrorHandler} from '@angular/core';
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
import {ErrorPageComponent} from './error_page/error_page.component';
import {MainPageComponent} from './main_page/main_page.component';
import {ErrorService} from './services/error.service';
import {RedirectService} from './services/redirect.service';
import {DataShareService} from './services/data_share.service';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ProjectSelectComponent,
    ErrorPageComponent,
    MainPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleChartsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [
    dataServiceProvider,
    DateUtilitiesService,
    GraphProcessorService,
    RedirectService,
    {
      provide: ErrorHandler,
      useClass: ErrorService,
    },
    DataShareService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
