import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-addemployee',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './addemployee.html',
  styleUrls: ['./addemployee.css'],
})
export class AddEmployee implements OnInit {
  // FILE

  selectedFile: File | null = null;

  // FORM GROUP

  employeeForm: any;

  // API

  apiUrl: string = 'http://localhost:3000/api';

  // OTHER

  employeeId: string | null = null;

  isEditMode = false;

  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      firstname: ['', Validators.required],

      lastname: ['', Validators.required],

      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        ],
      ],

      mobile: ['', Validators.required],

      address: ['', Validators.required],

      country: ['', Validators.required],

      state: ['', Validators.required],

      gender: ['', Validators.required],

      hobbies: [[], Validators.required],

      image: ['', Validators.required],
    });

    // EDIT MODE

    this.employeeId = this.route.snapshot.paramMap.get('id');

    this.isEditMode = !!this.employeeId;

    if (this.employeeId) {
      this.getEmployee(this.employeeId);
    }
  }

  // GET EMPLOYEE

  getEmployee(id: string) {
    this.loading = true;

    this.http.get(`${this.apiUrl}/employee/${id}`).subscribe({
      next: (result: any) => {
        this.employeeForm.patchValue({
          firstname: result.firstname,

          lastname: result.lastname,

          email: result.email,

          mobile: result.mobile,

          address: result.address,

          country: result.country,

          state: result.state,

          gender: result.gender,

          hobbies: result.hobbies ? result.hobbies.split(',') : [],

          image: result.image,
        });

        this.loading = false;
      },

      error: (err) => {
        console.log(err);

        this.toast.info('Employee Not Found', 'Sorry');

        this.loading = false;

        this.router.navigate(['/showdata']);
      },
    });
  }

  // HOBBIES

  onHobbyChange(event: any) {
    const value = event.target.value;

    const checked = event.target.checked;

    let hobbies = this.employeeForm.get('hobbies')?.value || [];

    if (checked) {
      hobbies.push(value);
    } else {
      hobbies = hobbies.filter((h: string) => h !== value);
    }

    this.employeeForm.patchValue({
      hobbies: hobbies,
    });

    this.employeeForm.get('hobbies')?.markAsTouched();
  }

  // CHECK HOBBY

  isHobbySelected(hobby: string): boolean {
    return this.employeeForm.get('hobbies')?.value?.includes(hobby);
  }

  // FILE CHANGE

  onFileChange(event: any) {
    const file = event.target.files[0];

    this.selectedFile = file || null;

    this.employeeForm.patchValue({
      image: file ? file.name : '',
    });

    this.employeeForm.get('image')?.markAsTouched();
  }

  // SAVE EMPLOYEE

  saveEmployee() {
    // INVALID FORM

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      return;
    }

    // FORM VALUE

    const employeeData = this.employeeForm.value;

    // FORMDATA

    const formData = new FormData();

    formData.append('firstname', employeeData.firstname);

    formData.append('lastname', employeeData.lastname);

    formData.append('email', employeeData.email);

    formData.append('mobile', employeeData.mobile);

    formData.append('address', employeeData.address);

    formData.append('country', employeeData.country);

    formData.append('state', employeeData.state);

    formData.append('gender', employeeData.gender);

    formData.append('hobbies', employeeData.hobbies.join(','));

    // IMAGE

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // API REQUEST

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}/updateemployee/${this.employeeId}`, formData)
      : this.http.post(`${this.apiUrl}/addemployee`, formData);

    // RESPONSE

    request.subscribe({
      next: (result: any) => {
        console.log(result);

        this.toast.success(
          this.isEditMode ? 'Employee Updated Successfully' : 'Employee Added Successfully',
        );

        this.router.navigate(['/showdata']);
      },

      error: (err) => {
        console.log(err);

        this.toast.error('Something Went Wrong');
      },
    });
  }
}
