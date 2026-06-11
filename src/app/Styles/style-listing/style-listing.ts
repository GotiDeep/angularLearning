import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from '../../services/permission';

@Component({
  selector: 'app-style-listing',
  imports: [CommonModule, RouterLink, NgSelectModule, ReactiveFormsModule],
  templateUrl: './style-listing.html',
  styleUrl: './style-listing.css',
})
export class StyleListing implements OnInit {

  apiUrl = "http://localhost:3000/api";
  styles: any[] = [];
  allStyles: any[] = [];
  Filter!: FormGroup;
  parameterTypes: any[] = [];
  parameterValues: any[] = [];
  masterData: any[] = [];
  searchText = '';
  selectedStyles: any[] = [];

  constructor(
    private http: HttpClient,
    private toast: ToastrService,
    private detect: ChangeDetectorRef,
    private router: Router,
    private fb: FormBuilder,
    public perm: PermissionService
  ) {}

  ngOnInit(): void {
    this.Filter = this.fb.group({
      filterType:  [],
      filterValue: [],
    });
    this.loadAllStyles();
    this.loadParameterTypes();
    this.loadMasterValues();
  }

  onAddStyle()    { this.router.navigate(['/styleMaster']); }
  onImportExcel() { this.router.navigate(['/importStyles']); }
  editStyle(id: any) { this.router.navigate(['/styleMaster', id]); }
  viewDetails(id: any) { this.router.navigate(['/styleDetails', id]); }

  deleteStyle(id: any) {
    if (!confirm('Are You Sure You Want To Delete?')) return;

    this.http.delete(`${this.apiUrl}/deleteStyle/${id}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.toast.success(res.message, "Success");
          this.loadAllStyles();
        }
      },
      error: (error) => {
        console.log("Error deleting style:", error);
        this.toast.error('Delete failed');
      }
    });
  }

  Logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    this.router.navigate(['/login']);
    this.toast.success('Logged Out Successfully', 'Bye!');
  }

  loadAllStyles() {
    this.http.get<any[]>(`${this.apiUrl}/getStyles`).subscribe({
      next: (res) => {
        this.styles = res;
        this.allStyles = res;
        this.detect.detectChanges();
      },
      error: (err) => console.log("Error loading styles:", err)
    });
  }

  loadParameterTypes() {
    this.http.get<any[]>(`${this.apiUrl}/getParams`).subscribe({
      next: (res) => {
        const allowed = ['CATEGORY', 'SUB_CATEGORY', 'GENDER', 'STATUS'];
        this.parameterTypes = res.filter((item: any) => allowed.includes(item.param_code));
        this.detect.detectChanges();
      }
    });
  }

  loadMasterValues() {
    this.http.get<any[]>(`${this.apiUrl}/loadAllParameters`).subscribe({
      next: (res) => {
        this.masterData = res;
        this.detect.detectChanges();
      }
    });
  }

  onTypeChange(event: any) {
    if (!event) {
      this.parameterValues = [];
      this.Filter.get('filterValue')?.patchValue(null);
      this.detect.detectChanges();
      return;
    }
    this.parameterValues = this.masterData.filter((item: any) => item.key_param === event.param_code);
    this.Filter.get('filterValue')?.patchValue(null);
  }

  onItemSelect(event: any) { this.applyFilters(); }

  onSearch(event: any) {
    this.searchText = event.target.value.toLowerCase().trim();
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allStyles];
    const selectedType  = this.Filter.get('filterType')?.value;
    const selectedValue = this.Filter.get('filterValue')?.value;

    if (selectedType && selectedValue) {
      if (selectedType.param_code === 'CATEGORY') {
        filtered = filtered.filter((s: any) => selectedValue.some((i: any) => i.param_name === s.category));
      }
      if (selectedType.param_code === 'SUB_CATEGORY') {
        filtered = filtered.filter((s: any) => selectedValue.some((i: any) => i.param_name === s.sub_category));
      }
      if (selectedType.param_code === 'GENDER') {
        filtered = filtered.filter((s: any) => selectedValue.some((i: any) => i.param_name === s.gender));
      }
      if (selectedType.param_code === 'STATUS') {
        filtered = filtered.filter((s: any) =>
          selectedValue.some((i: any) => (i.param_code === 'ACTIVE' ? 1 : 0) === s.statuss)
        );
      }
    }

    if (this.searchText) {
      filtered = filtered.filter((s: any) => {
        const statusText = s.statuss == 1 ? 'active' : 'inactive';
        return (
          s.style_number?.toLowerCase().includes(this.searchText) ||
          s.category?.toLowerCase().includes(this.searchText) ||
          s.sub_category?.toLowerCase().includes(this.searchText) ||
          s.gender?.toLowerCase().includes(this.searchText) ||
          s.product_title?.toLowerCase().includes(this.searchText) ||
          s.product_description?.toLowerCase().includes(this.searchText) ||
          statusText.includes(this.searchText)
        );
      });
    }

    this.styles = filtered;
  }

  onStyleSelect(id :any,event : any){
    if(event.target.checked){
      this.selectedStyles.push(id);
    }else{
      this.selectedStyles = this.selectedStyles.filter((s:any) => s !== id);
    }
  }

  Purchase(){

    if (!confirm('Are You Sure You Want To Place This Order?')) return;

    this.http.post<any>(`${this.apiUrl}/completeOrder`,{orderIds:this.selectedStyles}).subscribe({
      next:(res)=>{
        this.toast.success(`${res.message}`,"Order Confirmed");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      },
      error:(err)=>{
        this.toast.error(`${err.error.message}`,"Something Missing");
      }
    })
  }
}
