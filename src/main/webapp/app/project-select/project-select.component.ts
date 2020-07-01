import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Project, SortDirection, SortBy, ProjectComparators } from '../../model/project';
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
  /** The sort direction */
  public sortDirection: SortDirection;
  /** The field sorting by */
  public sortField: SortBy;

  // #region Fontawesome icons
  faIamArrow;
  faNameArrow;
  faProjectIdArrow;
  faProjectNumberArrow;
  faCircle;

  // #endregion

  @Output()
  public changeProjects = new EventEmitter<Project[]>();

  constructor() {
    this.activeProjects = new Set();
    this.faCircle = faCircle;

    this.sortDirection = SortDirection.DESCENDING;
    this.sortField = SortBy.IAM_BINDINGS;

    this.setSortIcons();
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

  /** Converts the DOM-friendly field name to the TypeScript enum */
  getField(fieldName: string): SortBy {
    if (fieldName === 'Project Name') {
      return SortBy.NAME;
    } else if (fieldName === 'IAM Bindings') {
      return SortBy.IAM_BINDINGS;
    } else if (fieldName === 'Project ID') {
      return SortBy.PROJECT_ID;
    } else if (fieldName === 'Project Number') {
      return SortBy.PROJECT_NUMBER;
    }

    // Default to IAM Bindings
    return SortBy.IAM_BINDINGS;
  }

  /** Returns the class placed on a sorting arrow, which decides whether it's grayed out or not */
  getSortClass(fieldName: string) {
    let field = this.getField(fieldName);
    if(field === this.sortField) {
      return 'sort-active';
    }
    return 'sort-inactive';
  }

  /** Sets the sorting icons on the table as appropriate. If a field is not being sorted, the arrow will be facing down */
  setSortIcons() {
    let primaryArrow = this.sortDirection === SortDirection.ASCENDING ? faArrowUp : faArrowDown;

    if (this.sortField === SortBy.IAM_BINDINGS) {
      this.faIamArrow = primaryArrow;
      this.faNameArrow = faArrowDown;
      this.faProjectIdArrow = faArrowDown;
      this.faProjectNumberArrow = faArrowDown;
    } else if (this.sortField === SortBy.NAME) {
      this.faIamArrow = faArrowDown;
      this.faNameArrow = primaryArrow;
      this.faProjectIdArrow = faArrowDown;
      this.faProjectNumberArrow = faArrowDown;
    } else if (this.sortField === SortBy.PROJECT_ID) {
      this.faIamArrow = faArrowDown;
      this.faNameArrow = faArrowDown;
      this.faProjectIdArrow = primaryArrow;
      this.faProjectNumberArrow = faArrowDown;
    } else if (this.sortField === SortBy.PROJECT_NUMBER) {
      this.faIamArrow = faArrowDown;
      this.faNameArrow = faArrowDown;
      this.faProjectIdArrow = faArrowDown;
      this.faProjectNumberArrow = primaryArrow;
    }
  }

  /** Change the sort field/direction, adjusts styling and sorts projects */
  changeSort(fieldName: string) {
    let field: SortBy = this.getField(fieldName);

    if (this.sortField === field) {
      // Just toggle the sort direction if we're sorting by the same field
      if (this.sortDirection === SortDirection.ASCENDING) {
        this.sortDirection = SortDirection.DESCENDING;
      } else {
        this.sortDirection = SortDirection.ASCENDING;
      }
    } else {
      // Set sort to ascending
      this.sortField = field;
      this.sortDirection = SortDirection.ASCENDING;
    }
    // Sort by the selected fields
    this.projects.sort(ProjectComparators.getComparator(this.sortDirection, this.sortField));
    this.setSortIcons();
  }

  ngOnInit() {
    fakeProjects();
    request('/list-project-summaries', 'GET').then(r => r.json()).then(projects => {
      // Sort by the selected fields
      projects.sort(ProjectComparators.getComparator(this.sortDirection, this.sortField));
      // Assign colors based on initial IAM Bindings order
      projects.forEach((project, index) => project.color = defaultColors[index % defaultColors.length])
      this.projects = projects;
    });
  }

}
