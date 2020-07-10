import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Project} from '../../model/project';
import {DEFAULT_COLORS, PROJECT_INACTIVE_COLOR} from '../../constants';
import {
  faArrowDown,
  faCircle,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {
  SortDirection,
  SortBy,
  ProjectComparators,
} from '../../model/project_sort';
import {DataService} from '../services/data.service';
import {ErrorMessageService} from '../services/error_message.service';
import {ErrorMessage} from '../../model/error_message';
import {ProjectQueryService} from '../services/project_query.service';

/** Component which lets users select which projects to display on the graph. */
@Component({
  selector: 'project-select',
  templateUrl: './project_select.component.html',
  styleUrls: ['./project_select.component.css'],
  animations: [
    trigger('rotateSort', [
      state('down', style({transform: 'rotate(0)'})),
      state('up', style({transform: 'rotate(180deg)'})),
      transition('up => down', animate('500ms ease-in-out')),
      transition('down => up', animate('500ms ease-in-out')),
    ]),
  ],
})
export class ProjectSelectComponent implements OnInit {
  /** All projects that are currently selected. */
  public activeProjects: Set<Project>;

  // #region DOM interraction variables
  /** Whether a particular arrow is rotated or not. */
  sortRotated: {[key: string]: 'down' | 'up'} = {
    iamBindings: 'down',
    projectName: 'down',
    projectId: 'down',
    projectNumber: 'down',
  };

  arrow = faArrowDown;
  circle = faCircle;
  filter = faFilter;

  // Convenience selectors
  public iamBindings = SortBy.IAM_BINDINGS;
  public projectName = SortBy.NAME;
  public projectId = SortBy.PROJECT_ID;
  public projectNumber = SortBy.PROJECT_NUMBER;
  // #endregion

  @Output()
  public changeProjects = new EventEmitter<Project[]>();

  constructor(
    private dataService: DataService,
    private errorMessageService: ErrorMessageService,
    private projectQueryService: ProjectQueryService
  ) {
    this.activeProjects = new Set();
  }

  /** Returns the color associated with the given project. */
  getColor(project: Project): string {
    if (this.activeProjects.has(project)) {
      return project.color;
    }
    return PROJECT_INACTIVE_COLOR;
  }

  /** Toggles the given projects presence on the graph. */
  toggleProject(project: Project) {
    if (this.activeProjects.has(project)) {
      this.activeProjects.delete(project);
    } else {
      this.activeProjects.add(project);
    }
    this.changeProjects.emit(Array.from(this.activeProjects));
  }

  /** Returns the class placed on a sorting arrow, which decides whether it's grayed out or not. */
  getSortClass(field: SortBy) {
    if (field === this.projectQueryService.sortField) {
      return 'sort-active';
    }
    return 'sort-inactive';
  }

  /** Returns the status (up or down) of the animation associated with the given sort field. */
  getAnimationStatus(field: SortBy): 'down' | 'up' {
    switch (field) {
      case SortBy.IAM_BINDINGS:
        return this.sortRotated.iamBindings;
      case SortBy.NAME:
        return this.sortRotated.projectName;
      case SortBy.PROJECT_ID:
        return this.sortRotated.projectId;
      case SortBy.PROJECT_NUMBER:
        return this.sortRotated.projectNumber;
    }
  }

  /** Swap the given animation from up to down or vice versa. */
  swapAnimationProperty(field: SortBy) {
    switch (field) {
      case SortBy.IAM_BINDINGS:
        this.sortRotated.iamBindings =
          this.sortRotated.iamBindings === 'down' ? 'up' : 'down';
        break;
      case SortBy.NAME:
        this.sortRotated.projectName =
          this.sortRotated.projectName === 'down' ? 'up' : 'down';
        break;
      case SortBy.PROJECT_ID:
        this.sortRotated.projectId =
          this.sortRotated.projectId === 'down' ? 'up' : 'down';
        break;
      case SortBy.PROJECT_NUMBER:
        this.sortRotated.projectNumber =
          this.sortRotated.projectNumber === 'down' ? 'up' : 'down';
        break;
    }
  }

  /** Change the sort field/direction, adjusts styling and sorts projects. */
  changeSort(field: SortBy) {
    if (this.getAnimationStatus(field) === 'down') {
      this.projectQueryService.changeField(field, SortDirection.ASCENDING);
    } else {
      this.projectQueryService.changeField(field, SortDirection.DESCENDING);
    }
    // Animate the selected field
    this.swapAnimationProperty(field);
  }

  /** Returns a sorted and filtered view of the projects. */
  getProjects(): Project[] {
    return this.projectQueryService.getProjects();
  }

  /** Changes the query string. */
  search(query: string) {
    this.projectQueryService.changeQuery(query);
  }

  /** Called when the component is ready to be displayed. */
  ngOnInit() {
    this.dataService.listProjects().then(projects => {
      if (projects instanceof Array) {
        this.projectQueryService.init(projects);
        // Assign colors based on initial ordering
        this.projectQueryService
          .getProjects()
          .forEach(
            (project, index) =>
              (project.color = DEFAULT_COLORS[index % DEFAULT_COLORS.length])
          );

        // Add the highest IAM Bindings project by default
        if (projects.length > 0) {
          this.toggleProject(projects[0]);
        }
      } else if (projects instanceof ErrorMessage) {
        this.errorMessageService.setErrors([projects]);
      }
    });
  }
}
