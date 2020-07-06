import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  request(url: string): Promise<any> {
    return this.http.get<any>(url).toPromise();
  }
}
