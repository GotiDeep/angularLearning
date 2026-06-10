import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-addemployee',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NgSelectComponent],
  templateUrl: './addemployee.html',
  styleUrls: ['./addemployee.css'],
})
export class AddEmployee implements OnInit {
  selectedFile: File | null = null;
  rolesList: any[] = [];
  employeeForm: any;
  apiUrl = 'http://localhost:3000/api';
  employeeId: string | null = null;
  isEditMode = false;
  loading = false;

  // ─── Logged-in user ki info ───
  // Sirf Admin hi role assign kar sakta hai
  isAdmin = false;
  currentUserRoleName = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    // ─── Logged-in user check ───
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.isAdmin = user.is_super_role === true;
      this.currentUserRoleName = user.role_name || '';
    }

    this.loadAllRoles();

    this.employeeForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      mobile:    ['', Validators.required],
      address:   ['', Validators.required],
      country:   ['', Validators.required],
      state:     ['', Validators.required],
      gender:    ['', Validators.required],
      hobbies:   [[], Validators.required],
      // ✅ image: Edit mode mein required nahi
      image:     [''],
      // ✅ role_id: Sirf admin ke liye required, baaki ke liye nahi
      role_id:   [this.isAdmin ? '' : null, this.isAdmin ? Validators.required : []],
    });

    // EDIT MODE
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.employeeId;

    // Add mode mein image required hai
    if (!this.isEditMode) {
      this.employeeForm.get('image')?.setValidators([Validators.required]);
      this.employeeForm.get('image')?.updateValueAndValidity();
    }

    if (this.employeeId) {
      this.getEmployee(this.employeeId);
    }
  }

  // ─── Employee data load (Edit mode) ───
  getEmployee(id: string) {
    this.loading = true;
    this.http.get(`${this.apiUrl}/employee/${id}`).subscribe({
      next: (result: any) => {
        this.employeeForm.patchValue({
          firstname: result.firstname,
          lastname:  result.lastname,
          email:     result.email,
          mobile:    result.mobile,
          address:   result.address,
          country:   result.country,
          state:     result.state,
          gender:    result.gender,
          hobbies:   result.hobbies ? result.hobbies.split(',') : [],
          image:     result.image,  // Purana image naam store karo
          role_id:   result.role_id,
        });
        this.loading = false;
      },
      error: () => {
        this.toast.info('Employee Not Found', 'Sorry');
        this.loading = false;
        this.router.navigate(['/showdata']);
      },
    });
  }

  // ─── Hobbies ───
  onHobbyChange(event: any) {
    const value = event.target.value;
    const checked = event.target.checked;
    let hobbies = this.employeeForm.get('hobbies')?.value || [];
    if (checked) { hobbies.push(value); }
    else { hobbies = hobbies.filter((h: string) => h !== value); }
    this.employeeForm.patchValue({ hobbies });
    this.employeeForm.get('hobbies')?.markAsTouched();
  }

  isHobbySelected(hobby: string): boolean {
    return this.employeeForm.get('hobbies')?.value?.includes(hobby);
  }

  // ─── File change ───
  onFileChange(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file || null;
    this.employeeForm.patchValue({ image: file ? file.name : '' });
    this.employeeForm.get('image')?.markAsTouched();
  }

  // ─── Save ───
  saveEmployee() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const employeeData = this.employeeForm.value;
    const formData = new FormData();

    formData.append('firstname', employeeData.firstname);
    formData.append('lastname',  employeeData.lastname);
    formData.append('email',     employeeData.email);
    formData.append('mobile',    employeeData.mobile);
    formData.append('address',   employeeData.address);
    formData.append('country',   employeeData.country);
    formData.append('state',     employeeData.state);
    formData.append('gender',    employeeData.gender);
    formData.append('hobbies',   employeeData.hobbies.join(','));

    // ✅ Image: naya file aaya to append karo, nahi to purana naam bhejo
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (employeeData.image) {
      formData.append('image', employeeData.image);  // Purana naam bhejo backend ko
    }

    // ✅ role_id: Sirf Admin case mein bhejo
    if (this.isAdmin && employeeData.role_id) {
      formData.append('role_id', employeeData.role_id);
    }

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}/updateemployee/${this.employeeId}`, formData)
      : this.http.post(`${this.apiUrl}/addemployee`, formData);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEditMode ? 'Employee Updated!' : 'Employee Added!');
        this.router.navigate(['/showdata']);
      },
      error: (err) => {
        const msg = err.error?.sqlMessage || err.error?.message || 'Something Went Wrong';
        this.toast.error(msg);
      },
    });
  }

  // ─── Roles load karo ───
  // ✅ Manager sirf Employee role dekh sakta hai (Admin aur Manager assign nahi kar sakta)
  loadAllRoles() {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get(`${this.apiUrl}/permissions/roles`, { headers }).subscribe({
      next: (res: any) => {
        let roles = res.roles || [];

        // Admin nahi = Admin role assign karne ki permission nahi
        // Manager/Employee sirf Employee role assign kar sakta hai
        if (!this.isAdmin) {
          roles = roles.filter((r: any) => r.role_name.toLowerCase() === 'employee');
        }

        this.rolesList = roles;
      },
      error: () => this.toast.error('Could not load roles'),
    });
  }
}
