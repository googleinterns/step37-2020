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
import {ProjectQueryService} from './services/project_query.service';
import {DataShareService} from './services/data_share.service';
import {DateSelectComponent} from './date_select/date_select.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    ProjectSelectComponent,
    ErrorPageComponent,
    MainPageComponent,
    DateSelectComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GoogleChartsModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressBarModule,
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
    ProjectQueryService,
    DataShareService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
