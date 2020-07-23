import {Component, OnInit} from '@angular/core';
import {DataService} from '../services/data.service';

/** Component page for the administration component. */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  /** Whether a manual update has been sent or not. */
  private sentManualUpdate: boolean;

  constructor(private dataService: DataService) {
    this.sentManualUpdate = false;
  }

  ngOnInit(): void {}

  /** Will send off a request to the manual-update servlet, but will enforce once per page load. */
  manualUpdate(): void {
    if (!this.sentManualUpdate) {
      this.sentManualUpdate = true;
      this.dataService.postManualUpdate();
    }
  }

  /** Whether to show the loading bar or not, depending on if there is an active request. */
  showLoadingBar(): boolean {
    return this.dataService.hasPendingRequest();
  }
}
