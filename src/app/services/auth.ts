import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  api = "http://localhost:3000/api";

  constructor(private http: HttpClient){}

  signup(data : any){
    return this.http.post(`${this.api}/signup`,data);
  }

  login(data : any){
    return this.http.post(`${this.api}/login`,data);
  }
}
