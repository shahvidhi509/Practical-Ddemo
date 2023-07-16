import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient
  ) { 

  }

  getSummaryData(): Observable<any> {
    return this.http.get('http://localhost:3000/project') as Observable<any>;
  }

  updateDetail(id: number, data: any): Observable<any> {
    return this.http.put(`http://localhost:3000/project/${id}`, data) as Observable<any>;
  }
   
}
