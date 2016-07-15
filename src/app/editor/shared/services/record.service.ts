import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';




@Injectable()
export class RecordService {
  private baseApiUrl: string = 'http://localhost:5000/api';
  
  constructor(private http: Http) { }

  fetchRecord(type: string, id: string): Observable<{}> {
    const apiUrl = `${this.baseApiUrl}/${type}/${id}/db`;
    return this.http.get(apiUrl)
      .map(res => res.json().metadata);
  }

  fetchSchema(url: string): Observable<{}> {
    // TODO: fetch the from url when backend returns resolved schema.
    return this.http.get('./assets/hep.json')
      .map(res => res.json().properties);
  }
}