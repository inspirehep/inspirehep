import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class RecordService {
  private baseApiUrl: string = 'http://localhost:5000/api';
  
  constructor(private http: Http) { }

  fetchRecord(type: string, id: string): Observable<{}> {
    const apiUrl = `${this.baseApiUrl}/${type}/${id}`;
    return this.http.get(apiUrl)
      .map(res => res.json().metadata);
  }
}