import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

/** Model of a service used to send redirects */
@Injectable()
export class RedirectService {
  constructor(private router: Router) {}

  redirect(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
