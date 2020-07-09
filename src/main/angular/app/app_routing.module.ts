import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {ErrorPageComponent} from './error-page/error-page.component';
import {MainPageComponent} from './main-page/main-page.component';
import {ERROR_PAGE_URL} from '../constants';

const routes: Routes = [
  {
    path: ERROR_PAGE_URL,
    component: ErrorPageComponent,
  },
  {
    path: 'main',
    component: MainPageComponent,
  },
  {
    path: '',
    redirectTo: '/main',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
