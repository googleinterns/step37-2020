import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Project } from '../../model/project';
import { request, fakeProjects } from '../../utils';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'project-select',
  templateUrl: './project-select.component.html',
  styleUrls: ['./project-select.component.css']
})
/** Component which lets users select which projects to display on the graph */
export class ProjectSelectComponent implements OnInit {
  /** All projects we have access to */
  public projects: Project[];
  /** All projects that are currently selected */
  public activeProjects: Set<Project>;

  @Output()
  public changeProjects = new EventEmitter<Project[]>();

  constructor() {
    this.activeProjects = new Set();
  }

  // #region Fontawesome icons
  faBindingArrow = faArrowDown;

  // #endregion

  toggleProject(project: Project) {

  }

  /** Toggle sorting by IAM ascending or descending */
  toggleIamSort() {
    if(this.faBindingArrow === faArrowDown) {
      this.faBindingArrow = faArrowUp;
      this.projects.sort(Project.iamAscendingOrder);
    } else {
      this.faBindingArrow = faArrowDown;
      this.projects.sort(Project.iamDescendingOrder);
    }
  }

  ngOnInit() {
    fakeProjects();
    request('/list-project-summaries', 'GET').then(r => r.json()).then(projects => {
      // To start, sort by IAM bindings in descending order
      projects.sort(Project.iamDescendingOrder);
      this.projects = projects;
      this.changeProjects.emit(projects);
    });
  }

}
