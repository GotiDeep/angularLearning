import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-style-listing',
  imports: [CommonModule,RouterLink, NgSelectModule, ReactiveFormsModule],
  templateUrl: './style-listing.html',
  styleUrl: './style-listing.css',
})
export class StyleListing implements OnInit{

  apiUrl="http://localhost:3000/api";
  styles:any[]=[];
  allStyles:any[]=[];

  Filter!:FormGroup;

  parameterTypes: any[] = [];

  parameterValues: any[] = [];

  masterData : any [] = [];

  searchText: string = '';

  constructor(
    private http : HttpClient,
    private toast : ToastrService,
    private detect : ChangeDetectorRef,
    private router : Router,
    private fb : FormBuilder
  ){}

  ngOnInit(): void {
    this.Filter = this.fb.group({
      filterType : [],
      filterValue: [],
    })

    this.loadAllStyles();
    this.loadParameterTypes();
    this.loadMasterValues();
    //this.loadParentParameters();
  }

  deleteStyle(id:any){
    const confirmdelete = confirm('Are You Sure You Want To Delete..');

    if (confirmdelete) {
      this.http.delete(`${this.apiUrl}/deleteStyle/${id}`).subscribe({
      next: (res:any) => {
        if(res.success){
          this.toast.success(res.message,"success");
          this.loadAllStyles();
        }
      },
      error: (error) => {
        console.log("Error deleting style:", error);
      }
     });
    }
  }
  editStyle(id:any){
    console.log("Edited",id);
    this.router.navigate(['/styleMaster',id]);
  }

  viewDetails(id: any) { 
    console.log ("Details",id);
    this.router.navigate(['/styleDetails',id]);
  }


  loadAllStyles() {
    this.http.get<any[]>(`${this.apiUrl}/getStyles`).subscribe({
      next: (res) => {
        this.styles = res;
        this.allStyles = res;
        this.detect.detectChanges();
        console.log(this.styles);
      },
      error: (error) => {
        console.log("Error loading styles:", error);
      }
    });
  }

  Logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);

    this.toast.success('Account Logged Out Successfully','Login')
  }

   loadParameterTypes(){
        this.http.get<any[]>(`${this.apiUrl}/getParams`).subscribe({
        next: (res) => {
          this.detect.detectChanges();
          const allowedTypes = ['CATEGORY', 'SUB_CATEGORY', 'GENDER', 'STATUS'];

          this.parameterTypes = res.filter((item: any) =>
            allowedTypes.includes(item.param_code)
          );
        }
      });
   }

   loadMasterValues() {
    this.http.get<any[]>(`${this.apiUrl}/loadAllParameters`).subscribe({
      next: (res) => {
        this.detect.detectChanges();
        this.masterData = res;
        console.log('masterData', this.masterData);
      }
    });
  }

    onTypeChange(event: any) {
    if (!event) {
      this.parameterValues = [];
      this.detect.detectChanges();
      this.Filter.get('filterValue')?.patchValue(null);
      return;
    }

    this.parameterValues = this.masterData.filter((item: any) =>
      item.key_param === event.param_code
    );
    console.log(this.parameterValues)

    this.Filter.get('filterValue')?.patchValue(null);
  }


  onItemSelect(event: any) {
    this.applyFilters();
}

  onSearch(event:any){
    this.searchText = event.target.value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allStyles];

    const selectedType = this.Filter.get('filterType')?.value;
    const selectedValue = this.Filter.get('filterValue')?.value;

    if (selectedType && selectedValue) {
      if (selectedType.param_code === 'CATEGORY') {
        filtered = filtered.filter((style:any)=>

        selectedValue.some(
            (item:any)=>
            item.param_name === style.category
        ));
      }

      if (selectedType.param_code === 'SUB_CATEGORY') {
        filtered = filtered.filter((style: any) =>
          selectedValue.some((
            (item:any)=>
              item.param_name === style.sub_category
          ))
        );
      }

      if (selectedType.param_code === 'GENDER') {
        filtered = filtered.filter((style: any) =>
          selectedValue.some((
            (item:any)=>
              item.param_name === style.gender
          ))
        );
      }

      if(selectedType.param_code === 'STATUS'){

          filtered = filtered.filter((style:any)=>{

              return selectedValue.some((item:any)=>{

                  const statusValue =
                      item.param_code === 'ACTIVE'
                      ? 1
                      : 0;

                  return style.statuss == statusValue;

              });

          });

      }
    }

    if (this.searchText) {
      filtered = filtered.filter((style: any) => {
        const statusText = style.statuss == 1 ? 'active' : 'inactive';

        return (
          style.style_number?.toLowerCase().includes(this.searchText) ||
          style.category?.toLowerCase().includes(this.searchText) ||
          style.sub_category?.toLowerCase().includes(this.searchText) ||
          style.gender?.toLowerCase().includes(this.searchText) ||
          style.product_title?.toLowerCase().includes(this.searchText) ||
          style.product_description?.toLowerCase().includes(this.searchText) ||
          statusText.includes(this.searchText)
        );
      });
    }

    this.styles = filtered;
  }

  importExcel(){
    this.router.navigate(['/importStyles']);
  }
    
}
