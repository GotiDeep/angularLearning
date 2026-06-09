import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Exportshared } from '../../services/exportshared';
import { ToastrService } from 'ngx-toastr';
import { PermissionService } from '../../services/permission';


interface Employee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  mobile: number;
  address: string;
  country: string;
  state: string;
  gender: string;
  hobbies: string;
  image: string;
}

@Component({
  selector: 'app-showdata',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './show-data.html',
  styleUrls: ['./show-data.css'],
})
export class ShowData implements OnInit {
  selectedIds: number[] = [];
  selection = 'All';
  
  employee: Employee[] = [];

  selectedEmployees: number[] = [];

  loading: boolean = false;

  apiUrl: string = 'http://localhost:3000/api';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private eSS: Exportshared,
    private toastr: ToastrService,
    private perm : PermissionService
  ) {}

  ngOnInit(): void {
    this.getEmployees();
    this.eSS.selectedId$.subscribe((ids) => {
      this.selectedIds = ids;
    });
  }

  // GET ALL EMPLOYEES

  getEmployees() {
    this.loading = true;

    this.http.get(`${this.apiUrl}/showdata`).subscribe({
      next: (result: any) => {
        console.log(result);

        this.employee = result;

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.log(err);

        this.toastr.error('Failed To Fetch Data From The Db','Error');

        this.loading = false;
      },
    });
  }

  // DELETE EMPLOYEE

  deleteEmployee(id: number) {

    if(!this.perm.canDelete('Employees')){
      this.toastr.warning("Sorry, you don't have permission to Delete!", "Access Denied 🚫");
      return;
    }

    if (confirm('Are you sure want to delete this employee?')) {
      this.http.delete(`${this.apiUrl}/deleteemployee/${id}`).subscribe({
        next: (result: any) => {
          console.log(result);

          this.toastr.warning('Toast Is Deleted SuccessFully','Notification')

          this.getEmployees();
        },

        error: (err) => {
          console.log(err);

          this.toastr.error('Delete Error','Error');
        },
      });
    }
  }

  // EDIT EMPLOYEE

  editEmployee(emp: Employee) {
    if(!this.perm.canWrite('Employees')){
      this.toastr.warning("Sorry, you don't have permission to Edit!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/editemployee', emp.id]);
  }

  getImageSrc(emp: Employee) {
    return emp.image
      ? `http://localhost:3000/uploads/${emp.image}`
      : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23dfe5ec"/%3E%3Ctext x="25" y="31" text-anchor="middle" font-size="18" fill="%2364758b"%3ENA%3C/text%3E%3C/svg%3E';
  }

  toggleSelection(id: number) {
    if (this.selectedEmployees.includes(id)) {
      this.selectedEmployees = this.selectedEmployees.filter((empId) => empId !== id);
    } else {
      this.selectedEmployees.push(id);
    }
    this.eSS.setSelectedIds(this.selectedEmployees);
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('permissions');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);

    this.toastr.success('Account Logged Out Successfully','Login')
  }

  importExcel() {
    if (!this.perm.canImport('Employees')) {
      this.toastr.warning("Sorry, you don't have permission to Import!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/import']);
  }

  exportExcel() {

    if(!this.perm.canExport('Employees')){
      this.toastr.warning("Sorry, you don't have permission to Export!", "Access Denied 🚫");
      return;
    }

    if (this.selectedIds.length == 0 && this.selection == 'Selected') {
      this.toastr.error('Select Data first...');
    } else if (this.selectedIds.length == 0 && this.selection == 'Non Selected') {
      this.toastr.error('Select Data first...');
    } else {
      
    }
    const data = {
        selection: this.selection,
        selectedIds: this.selectedIds,
      };

      this.http
        .post('http://localhost:3000/api/exportexcel', data, {
          responseType: 'blob',
        })
        .subscribe((res: any) => {
          const blob = new Blob([res], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');

          a.href = url;

          if(a.download = `${this.selection}Employees.xlsx`){
            this.toastr.success('File Exported Successfully...', 'Export');
          }
          a.click();
        });
  }

  showCustomers(){
    if(!this.perm.canView('Customers')){
      this.toastr.warning("Sorry, you don't have permission to View!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/customers'])
  }

  showStyles(){
    if(!this.perm.canView('Style')){
      this.toastr.warning("Sorry, you don't have permission to Views Styles!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/styleListing'])
  }

  employeeDetails(employeeId:any){
    if(!this.perm.canView('Employee')){
      this.toastr.warning("Sorry, you don't have permission to View!", "Access Denied 🚫");
      return;
    }
    window.open(`${this.apiUrl}/employeeDetails/${employeeId}`,
      '_blank'
    )
  }

  printEmployees(){
    if(!this.perm.canView('Employees')){
      this.toastr.warning("Sorry, you don't have permission to Print!", "Access Denied 🚫");
      return;
    }
    window.open(`${this.apiUrl}/printEmployees`,
      '_blank'
    )
  }

  addEmployee(){
    if(!this.perm.canWrite('Employees')){
      this.toastr.warning("Sorry, you don't have permission to Create!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/addemployee'])
  }

  permissionManager(){
    if(!this.perm.canView('Permissions')){
      this.toastr.warning("Sorry, you don't have permission to View Permissions!", "Access Denied 🚫");
      return;
    }
    this.router.navigate(['/permissions']);
  }
}
