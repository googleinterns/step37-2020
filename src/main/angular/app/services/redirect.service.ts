import {Injectable} from '@angular/core';
/** Model of a service used to send redirects */

@Injectable()
export abstract class RedirectService {
  /** Sends a redirect to the given path. Note that this method adds the requisite '/' */
  abstract redirect(path: string): void;
}
