import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Showdataservice {
  apiurl = "http://localhost:3000/employeesp";

  constructor(private http: HttpClient){}

  getEmployeeData(){
    return this.http.get(this.apiurl);
  }

}
