import {Component, OnInit, Output, EventEmitter} from '@angular/core';
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
import {ResourceType, Resource} from '../../model/resource';
import {Project} from '../../model/project';
import {Organization} from '../../model/organization';

/** Component which lets users select which projects and organizations to display on the graph. */
@Component({
  selector: 'resource-select',
  templateUrl: './resource_select.component.html',
  styleUrls: ['./resource_select.component.css'],
  animations: [
    trigger('rotateSort', [
      state('down', style({transform: 'rotate(0)'})),
      state('up', style({transform: 'rotate(180deg)'})),
      transition('up => down', animate('500ms ease-in-out')),
      transition('down => up', animate('500ms ease-in-out')),
    ]),
  ],
})
export class ResourceSelectComponent implements OnInit {
  /** All projects that are currently selected. */
  public activeProjects: Set<Project>;
  /** All organizations that are currently selected. */
  public activeOrganizations: Set<Organization>;
  /** The resource to display. Now it's just projects or organizations, but can be expanded. */
  public displayType: ResourceType;

  // #region DOM interraction variables
  /** Whether a particular arrow is rotated or not. */
  sortRotated: {
    project: {[field: string]: 'down' | 'up'};
    organization: {[field: string]: 'down' | 'up'};
  } = {
    project: {
      iamBindings: 'down',
      name: 'down',
      id: 'down',
      number: 'down',
    },
    organization: {
      iamBindings: 'down',
      name: 'down',
      id: 'down',
    },
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
  @Output()
  public changeResource = new EventEmitter<ResourceType>();

  constructor(
    private dataService: DataService,
    private queryService: QueryService
  ) {
    this.activeProjects = new Set();
    this.activeOrganizations = new Set();
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
    if (
      (resource.getResourceType() === ResourceType.ORGANIZATION &&
        this.activeOrganizations.has(resource as Organization)) ||
      (resource.getResourceType() === ResourceType.PROJECT &&
        this.activeProjects.has(resource as Project))
    ) {
      return resource.color;
    }
    return PROJECT_INACTIVE_COLOR;
  }

  /** Toggles the given resources presence on the graph. */
  toggleResource(resource: Resource) {
    if (resource.getResourceType() === ResourceType.ORGANIZATION) {
      const organization = resource as Organization;
      if (this.activeOrganizations.has(organization)) {
        this.activeOrganizations.delete(organization);
      } else {
        this.activeOrganizations.add(organization);
      }
      this.changeSelection.emit(Array.from(this.activeOrganizations));
    } else if (resource.getResourceType() === ResourceType.PROJECT) {
      const project = resource as Project;
      if (this.activeProjects.has(project)) {
        this.activeProjects.delete(project);
      } else {
        this.activeProjects.add(project);
      }
      this.changeSelection.emit(Array.from(this.activeProjects));
    }
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
    let typeStatus: {[field: string]: 'down' | 'up'};
    if (this.displayType === ResourceType.ORGANIZATION) {
      typeStatus = this.sortRotated.organization;
    } else if (this.displayType === ResourceType.PROJECT) {
      typeStatus = this.sortRotated.project;
    }

    switch (field) {
      case SortBy.IAM_BINDINGS:
        return typeStatus.iamBindings;
      case SortBy.NAME:
        return typeStatus.name;
      case SortBy.ID:
        return typeStatus.id;
      case SortBy.PROJECT_NUMBER:
        return typeStatus.number;
    }
  }

  /** Swap the given animation from up to down or vice versa. */
  swapAnimationProperty(field: SortBy) {
    let typeStatus: {[field: string]: 'down' | 'up'};
    if (this.displayType === ResourceType.ORGANIZATION) {
      typeStatus = this.sortRotated.organization;
    } else if (this.displayType === ResourceType.PROJECT) {
      typeStatus = this.sortRotated.project;
    }

    switch (field) {
      case SortBy.IAM_BINDINGS:
        typeStatus.iamBindings =
          typeStatus.iamBindings === 'down' ? 'up' : 'down';
        break;
      case SortBy.NAME:
        typeStatus.name = typeStatus.name === 'down' ? 'up' : 'down';
        break;
      case SortBy.ID:
        typeStatus.id = typeStatus.id === 'down' ? 'up' : 'down';
        break;
      case SortBy.PROJECT_NUMBER:
        typeStatus.number = typeStatus.number === 'down' ? 'up' : 'down';
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

  /** Returns a sorted and filtered view of the projects. */
  getProjects(): Project[] {
    return this.queryService.getProjects();
  }

  /** Returns a sorted and filtered view of the organizations. */
  getOrganizations(): Organization[] {
    return this.queryService.getOrganizations();
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
