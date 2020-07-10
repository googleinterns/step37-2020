import {Injectable} from '@angular/core';
import {RedirectService} from '../redirect.service';
import {Router} from '@angular/router';

/** Concrete class which actually redirects the user to the given page. */
@Injectable()
export class RedirectImplService implements RedirectService {
  constructor(private router: Router) {}

  redirect(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
