import {Injectable} from '@angular/core';
import {RedirrectService} from '../redirrect.service';

/** Service used to fake out redirrects in the application. */
@Injectable()
export class FakeRedirrectService implements RedirrectService {
  /** The redirrects sent by the application. */
  private redirrects: string[];

  constructor() {
    this.redirrects = [];
  }

  redirrect(path: string): void {
    this.redirrects.push(path);
  }

  /** Checks if the given path had a redirrected sent. */
  redirrectSent(path: string): boolean {
    return this.redirrects.includes(path);
  }
}
