import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Project } from '../../model/project';
import { request, fakeProjects, defaultColors } from '../../utils';
import { faArrowDown, faArrowUp, faCircle } from '@fortawesome/free-solid-svg-icons';

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
  /** Whether sorting ascending or descending */
  public sortAscending = true;
  /** Whether sorting by IAM or project name */
  public sortIam = true;

  // #region Fontawesome icons
  faBindingArrow;
  faCircle;

  // #endregion

  @Output()
  public changeProjects = new EventEmitter<Project[]>();

  constructor() {
    this.activeProjects = new Set();
    this.faBindingArrow = faArrowDown;
    this.faCircle = faCircle;
  }

  /** Returns the color associated with the given project */
  getColor(project: Project): string {
    if (this.activeProjects.has(project)) {
      return project.color;
    } 
    return '#b8b8b8';
  }

  /** Toggles the given projects presence on the graph */
  toggleProject(project: Project) {
    if (this.activeProjects.has(project)) {
      this.activeProjects.delete(project);
    } else {
      this.activeProjects.add(project);
    }
    this.changeProjects.emit(Array.from(this.activeProjects));
  }

  /** Toggle sorting by IAM ascending or descending */
  toggleIamSort() {
    if (this.faBindingArrow === faArrowDown) {
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
      // Assign colors based on initial IAM Bindings order
      projects.forEach((project, index) => project.color = defaultColors[index % defaultColors.length])
      this.projects = projects;
    });
  }

}
