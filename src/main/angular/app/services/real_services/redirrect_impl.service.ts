import {Injectable} from '@angular/core';
import {RedirrectService} from '../redirrect.service';
import {Router} from '@angular/router';

/** Concrete class which actually redirrects the user to the given page. */
@Injectable()
export class RedirrectImplService implements RedirrectService {
  constructor(private router: Router) {}

  redirrect(path: string): void {
    this.router.navigate([`/${path}`]);
  }
}
