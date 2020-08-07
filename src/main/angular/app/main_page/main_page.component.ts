import {Component, OnInit} from '@angular/core';
import {Resource} from '../../model/resource';

/** The main landing page for the application. It primarily contains the graph and resource select. */
@Component({
  selector: 'app-main-page',
  templateUrl: './main_page.component.html',
  styleUrls: ['./main_page.component.css'],
})
export class MainPageComponent implements OnInit {
  public displayResources: Resource[] = [];
  async ngOnInit() {}

  /** Called when the resource-select component changes the resources to display. */
  changeSelection(resources: Resource[]) {
    this.displayResources = resources;
  }
}
