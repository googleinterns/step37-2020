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
import {ErrorPageComponent} from './error_page/error_page.component';
import {MainPageComponent} from './main_page/main_page.component';
import {ErrorMessageService} from './services/error_message.service';
import {RedirrectService} from './services/redirrect.service';
import {RedirrectImplService} from './services/real_services/redirrect_impl.service';

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
    ErrorMessageService,
    {
      provide: RedirrectService,
      useClass: RedirrectImplService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
