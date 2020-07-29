import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Project as Resource} from '../../model/project';
import {DEFAULT_COLORS, PROJECT_INACTIVE_COLOR} from '../../constants';
import {
  faArrowDown,
  faCircle,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import {trigger, state, style, transition, animate} from '@angular/animations';
import {SortDirection, SortBy} from '../../model/sort_methods';
import {DataService} from '../services/data.service';
import {QueryService} from '../services/query.service';
import {IAMResource, ResourceType, Resource} from '../../model/resource';

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
  /** All resources that are currently selected. */
  public activeResources: Set<Resource>;
  /** The resource to display. Now it's just projects or organizations, but can be expanded. */
  public displayType: ResourceType;

  // #region DOM interraction variables
  /** Whether a particular arrow is rotated or not. */
  sortRotated: {[key: string]: 'down' | 'up'} = {
    iamBindings: 'down',
    name: 'down',
    id: 'down',
    projectNumber: 'down',
  };

  arrow = faArrowDown;
  circle = faCircle;
  filter = faFilter;

  // Convenience selectors
  public iamBindings = SortBy.IAM_BINDINGS;
  public name = SortBy.NAME;
  public id = SortBy.ID;
  public projectNumber = SortBy.PROJECT_NUMBER;

  public organization = ResourceType.ORGANIZATION;
  public project = ResourceType.PROJECT;
  // #endregion

  @Output()
  public changeSelection = new EventEmitter<Resource[]>();

  constructor(
    private dataService: DataService,
    private queryService: QueryService
  ) {
    this.activeResources = new Set();
    this.displayType = ResourceType.PROJECT;
  }

  /** Checks whether to show the loading bar based on whether there is an active web request or not. */
  showLoadingBar(): boolean {
    return this.dataService.hasPendingRequest();
  }

  /** Toggles whether to display projects or organizations. */
  toggleDisplay() {
    // Invert the display type
    if (this.displayType === ResourceType.ORGANIZATION) {
      this.displayType = ResourceType.PROJECT;
    } else {
      this.displayType = ResourceType.ORGANIZATION;

      if (this.queryService.getSortField() === SortBy.PROJECT_NUMBER) {
        // Number field isn't available on organizations, so switch to IAM
        this.queryService.changeField(
          SortBy.IAM_BINDINGS,
          this.queryService.getSortDirection()
        );
      }
    }
    this.queryService.changeResourceType(this.displayType);
  }

  /** Returns the color associated with the given resource. */
  getColor(resource: Resource): string {
    if (this.activeResources.has(resource)) {
      return resource.color;
    }
    return PROJECT_INACTIVE_COLOR;
  }

  /** Toggles the given resources presence on the graph. */
  toggleResource(resource: Resource) {
    if (this.activeResources.has(resource)) {
      this.activeResources.delete(resource);
    } else {
      this.activeResources.add(resource);
    }
    this.changeSelection.emit(Array.from(this.activeResources));
  }

  /** Returns the class placed on a sorting arrow, which decides whether it's grayed out or not. */
  getSortClass(field: SortBy) {
    if (field === this.queryService.getSortField()) {
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
        return this.sortRotated.name;
      case SortBy.ID:
        return this.sortRotated.id;
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
        this.sortRotated.name =
          this.sortRotated.name === 'down' ? 'up' : 'down';
        break;
      case SortBy.ID:
        this.sortRotated.id = this.sortRotated.id === 'down' ? 'up' : 'down';
        break;
      case SortBy.PROJECT_NUMBER:
        this.sortRotated.projectNumber =
          this.sortRotated.projectNumber === 'down' ? 'up' : 'down';
        break;
    }
  }

  /** When the user clicks the sorting arrow, changes the sort field/direction. */
  toggleSort(field: SortBy) {
    if (this.getAnimationStatus(field) === 'down') {
      this.queryService.changeField(field, SortDirection.ASCENDING);
    } else {
      this.queryService.changeField(field, SortDirection.DESCENDING);
    }
    // Animate the selected field
    this.swapAnimationProperty(field);
  }

  /** When the user clicks the field name, just change the sort field. */
  changeField(field: SortBy) {
    if (this.getAnimationStatus(field) === 'down') {
      this.queryService.changeField(field, SortDirection.DESCENDING);
    } else {
      this.queryService.changeField(field, SortDirection.ASCENDING);
    }
  }

  /** Returns a sorted and filtered view of the resources. */
  getResources(): IAMResource[] {
    return this.queryService.getResources() as IAMResource[];
  }

  /** Changes the query string. */
  search(query: string) {
    this.queryService.changeQuery(query);
  }

  /** Called when the component is ready to be displayed. */
  ngOnInit() {
    this.dataService.listSummaries().then(summaryData => {
      const projects = summaryData.projects;
      const organizations = summaryData.organizations;
      this.queryService.init(projects, organizations);
      // Assign colors based on initial ordering
      this.queryService.assignColors(DEFAULT_COLORS);

      // Add the highest IAM Bindings project by default
      if (projects.length > 0) {
        this.toggleResource(projects[0]);
      }
    });
  }
}
