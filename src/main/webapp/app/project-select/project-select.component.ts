import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Project, SortDirection, SortBy, ProjectComparators } from '../../model/project';
import { request, fakeProjects, defaultColors } from '../../utils';
import { faArrowDown, faArrowUp, faCircle } from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'project-select',
  templateUrl: './project-select.component.html',
  styleUrls: ['./project-select.component.css'],
  animations: [
    trigger('rotateSort', [
      state('default', style({ transform: 'rotate(0)' })),
      state('rotated', style({ transform: 'rotate(180deg)' })),
      transition('rotated => default', animate('500ms ease-in-out')),
      transition('default => rotated', animate('500ms ease-in-out')),
    ]),
  ]
})
/** Component which lets users select which projects to display on the graph */
export class ProjectSelectComponent implements OnInit {
  /** All projects we have access to */
  public projects: Project[];
  /** All projects that are currently selected */
  public activeProjects: Set<Project>;
  /** The sort direction */
  public currentSortDirection: SortDirection;
  /** The field sorting by */
  public currentSortField: SortBy;



  // #region DOM interraction variables
  /** Whether a particular arrow is rotated or not */
  sortRotated = {
    iamBindings: 'default',
    projectName: 'default',
    projectId: 'default',
    projectNumber: 'default'
  }

  faArrow = faArrowDown;
  faCircle;

  // Convenience selectors
  public iamBindings = SortBy.IAM_BINDINGS;
  public projectName = SortBy.NAME;
  public projectId = SortBy.PROJECT_ID;
  public projectNumber = SortBy.PROJECT_NUMBER;
  // #endregion

  @Output()
  public changeProjects = new EventEmitter<Project[]>();

  constructor() {
    this.activeProjects = new Set();
    this.faCircle = faCircle;

    this.currentSortDirection = SortDirection.DESCENDING;
    this.currentSortField = SortBy.IAM_BINDINGS;
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

  /** Returns the class placed on a sorting arrow, which decides whether it's grayed out or not */
  getSortClass(field: SortBy) {
    // let field = this.getField(fieldName);
    if (field === this.currentSortField) {
      return 'sort-active';
    }
    return 'sort-inactive';
  }

  swapAnimationProperty(field: SortBy) {
    switch (field) {
      case SortBy.IAM_BINDINGS: this.sortRotated.iamBindings = (this.sortRotated.iamBindings === 'default') ? 'rotated' : 'default'; break;
      case SortBy.NAME: this.sortRotated.projectName = (this.sortRotated.projectName === 'default') ? 'rotated' : 'default'; break;
      case SortBy.PROJECT_ID: this.sortRotated.projectId = (this.sortRotated.projectId === 'default') ? 'rotated' : 'default'; break;
      case SortBy.PROJECT_NUMBER: this.sortRotated.projectNumber = (this.sortRotated.projectNumber === 'default') ? 'rotated' : 'default'; break;
    }
  }

  /** Change the sort field/direction, adjusts styling and sorts projects */
  changeSort(field: SortBy) {
    if (this.currentSortField === field) {
      // Just toggle the sort direction if we're sorting by the same field
      if (this.currentSortDirection === SortDirection.ASCENDING) {
        this.currentSortDirection = SortDirection.DESCENDING;
      } else {
        this.currentSortDirection = SortDirection.ASCENDING;
      }
    } else {
      // Set sort to ascending
      this.currentSortField = field;
      this.currentSortDirection = SortDirection.ASCENDING;
    }
    // Sort by the selected fields
    this.projects.sort(ProjectComparators.getComparator(this.currentSortDirection, this.currentSortField));

    // Animate the selected field
    this.swapAnimationProperty(field);

    // this.setSortIcons();
  }

  ngOnInit() {
    fakeProjects();
    request('/list-project-summaries', 'GET').then(r => r.json()).then(projects => {
      // Sort by the selected fields
      projects.sort(ProjectComparators.getComparator(this.currentSortDirection, this.currentSortField));
      // Assign colors based on initial IAM Bindings order
      projects.forEach((project, index) => project.color = defaultColors[index % defaultColors.length])
      this.projects = projects;
      // Add the highest IAM Bindings project by default
      if (projects.length > 0) {
        this.toggleProject(projects[0]);
      }
    });
  }

}
