import {Component, OnInit} from '@angular/core';
import {Project} from '../../model/project';

/** The main landing page for the application. It primarily contains the graph and project select */
@Component({
  selector: 'app-main-page',
  templateUrl: './main_page.component.html',
  styleUrls: ['./main_page.component.css'],
})
export class MainPageComponent implements OnInit {
  public displayProjects: Project[] = [];
  async ngOnInit() {}

  /** Called when the project-select component changes the projects to display. */
  changeProjects(projects: Project[]) {
    this.displayProjects = projects;
  }
}
