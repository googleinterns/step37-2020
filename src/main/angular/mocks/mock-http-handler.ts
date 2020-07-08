/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FakeDataService} from '../app/fake-data.service';

/** Mock class for Angular's HttpHandler. */
export class MockHttpHandler extends HttpHandler {
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    console.log(req.url);
    if (req.url === '/list-project-summaries') {
      return new Observable(observer => {
        observer.next(
          new HttpResponse<any>({
            body: this.fakeDataService.listProjects(),
          })
        );
      });
    } else if (req.url.includes('/get-project-data')) {
      return new Observable(observer => {
        const id = req.params.get('id');
        if (id) {
          observer.next(
            new HttpResponse<any>({
              body: this.fakeDataService.getProjectGraphData(id),
            })
          );
          observer.complete();
        }
      });
    }

    return this.emptyObservable();
  }

  private emptyObservable(): Observable<HttpEvent<any>> {
    return new Observable(observer => {
      observer.next(new HttpResponse<any>());
      observer.complete();
    });
  }

  constructor(private fakeDataService: FakeDataService) {
    super();
  }
}
