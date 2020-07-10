import {Injectable} from '@angular/core';
import {RedirectService} from '../redirect.service';

/** Service used to fake out redirects in the application. */
@Injectable()
export class FakeRedirectService implements RedirectService {
  /** The redirects sent by the application. */
  private redirects: string[];

  constructor() {
    this.redirects = [];
  }

  redirect(path: string): void {
    this.redirects.push(path);
  }

  /** Checks if the given path had a redirected sent. */
  redirectSent(path: string): boolean {
    return this.redirects.includes(path);
  }
}
