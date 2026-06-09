import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AfterViewInit } from '@angular/core';
import { PermissionService } from '../../services/permission';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements AfterViewInit {
  selectedIds: any[] = [];
  selection = 'All';

  customerId: any;

  isEditMode: boolean = false;

  customers: any[] = [];

  selectedCustomers: any[] = [];

  loading: boolean = false;

  apiUrl: string = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private perm : PermissionService
  ) {}

  ngAfterViewInit(): void {
    this.getCustomers();
  }

  showEmployees(){
    if(!this.perm.canView('Employees')){
      this.toastr.warning("Sorry, you don't have permission to View!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/showdata']);
  }

  showStyles(){
    if(!this.perm.canView('Styles')){
      this.toastr.warning("Sorry, you don't have permission to View!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/styleListing']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('users');
    localStorage.removeItem('permissions');
    this.router.navigate(['/login']);

    this.toastr.success('Account Logged Out Successfully', 'Login');
  }

  importExcel() {
    if(!this.perm.canImport('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Import!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/importCustomers']);
  }

  exportExcel() {

    if(!this.perm.canExport('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Export!", "Access Denied 🚫");
      return;
    }
    const exportData = {
      selection: this.selection,

      selectedCustomers: this.selectedCustomers,
    };

    this.http
      .post(
        `${this.apiUrl}/exportCustomers`,

        exportData,

        {
          responseType: 'blob',
        },
      )
      .subscribe({
        next: (result) => {
          // FILE DOWNLOAD

          const fileURL = window.URL.createObjectURL(result);

          const link = document.createElement('a');

          link.href = fileURL;

          link.download = 'customers.xlsx';

          link.click();
        },

        error: (err) => {
          console.log(err);
        },
      });
  }

  onCheckboxChange(event: any, customerId: any) {
    const checked = event.target.checked;
    if (checked) {
      this.selectedCustomers.push(customerId);
    } else {
      this.selectedCustomers = this.selectedCustomers.filter((id) => id != customerId);
    }
  }

  editCustomer(customerId: any) {
    if(!this.perm.canWrite('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Edit!", "Access Denied 🚫");
      return;
    }
    this.router.navigate([`/editCustomer/${customerId}`]);
  }

  toggleSelection(id: string) {
    // ALREADY SELECTED

    if (this.selectedCustomers.includes(id)) {
      // REMOVE

      this.selectedCustomers = this.selectedCustomers.filter((empId) => empId !== id);
    }

    // NOT SELECTED
    else {
      // ADD

      this.selectedCustomers.push(id);
    }
  }

  deleteCustomer(customerId: any) {
    if(!this.perm.canDelete('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Delete!", "Access Denied 🚫");
      return;
    }
    const confirmdelete = confirm('Are You Sure You Want To Delete..');

    if (confirmdelete) {
      this.http.delete(`${this.apiUrl}/deleteCustomer/${customerId}`).subscribe({
        next: (result) => {
          this.toastr.success(`${customerId} Customer Deleted`);
          this.getCustomers();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  addCustomers() {
    if(!this.perm.canWrite('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Add!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/addcustomers']);
  }

  getCustomers() {
    this.loading = true;

    this.http.get<any[]>(`${this.apiUrl}/customers`).subscribe({
      next: (result) => {
        this.customers = result || [];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.log(err);

        this.loading = false;
      },
    });
  }

  CustomerDetails(customerId:any){

    if(!this.perm.canView('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Print!", "Access Denied 🚫");
      return;
    }

    window.open(`${this.apiUrl}/customerDetails/${customerId}`,
      "_blank"
    );
  }

  printCustomers(){

    if(!this.perm.canView('Customers')){
      this.toastr.warning("Sorry, you don't have permission to Print!", "Access Denied 🚫");
      return;
    }

    window.open(`${this.apiUrl}/printCustomersDetails`,
      "_blank"
    );
  }

  permissionManager(){
    if(!this.perm.canView('Permissions')){
      this.toastr.warning("Sorry, you don't have permission to View Permissions!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/permissions']);
  }
  
}
