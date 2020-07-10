import {Injectable} from '@angular/core';
/** Model of a service used to send redirrects */
@Injectable()
export abstract class RedirrectService {
  /** Sends a redirrect to the given path. Note that this method adds the requisite '/' */
  abstract redirrect(path: string): void;
}
