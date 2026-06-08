import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-style-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './style-details.html',
  styleUrl: './style-details.css',
})
export class StyleDetails implements OnInit {

  masterParams:any[]=[];
  style: any = {};
  metals: any[] = [];
  diamonds: any[] = [];

  apiUrl ="http://localhost:3000/api";
  constructor(
    private http : HttpClient,
    private toast : ToastrService,
    private route : ActivatedRoute,
    private detect : ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.fetchStyle();
    this.loadAllParameters();
  }

  fetchStyle(){
    const id = this.route.snapshot.paramMap.get('id');
    console.log("id",id);
    this.http.get<any>(`${this.apiUrl}/getStyleById/${id}`).subscribe({
      next: (response: any) => {
        if(response.success){
          this.style = response.data.master;
          this.metals = response.data.metals;
          this.diamonds = response.data.diamonds;
          this.detect.detectChanges();
        }
      }
    })
  }

  loadAllParameters(){
    this.http.get<any>(`${this.apiUrl}/loadAllParameters`).subscribe({
      next: (response: any) => {
          this.masterParams = response;
          this.detect.detectChanges();
          console.log(this.masterParams);
      }
    })
  }

  getParamLabel(paramId:any): string{
    if(!paramId|| this.masterParams.length === 0){ return "";}
    const param = this.masterParams.find((item:any) => item.param_id == paramId
    );
    return param ? param.param_name : paramId;
  }
}
