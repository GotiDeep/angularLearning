import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-customers',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './add-customers.html',
  styleUrl: './add-customers.css',
})
export class AddCustomers implements OnInit {
  customerForm: any;

  selectedFile: File | null = null;

  apiUrl: string = 'http://localhost:3000/api';

  // OTHER

  customerId: string | null = null;

  isEditMode = false;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      customerId: [
        {
          value: '',
          disabled: true,
        },
      ],
      customerImage: ['', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
        ],
      ],
      customerMobile: ['',
      [
        Validators.required, 
        Validators.pattern('^[6-9][0-9]{9}')],
        Validators.maxLength(10),
        Validators.minLength(10)
      ],
      customerDOB: ['', Validators.required],
      customerCity: ['', Validators.required],
    });

    this.customerId = this.route.snapshot.paramMap.get('customerId');

    this.isEditMode = !!this.customerId;

    if (this.customerId) {
      this.getCustomer(this.customerId);
    }

    // ADD MODE
    else {
      this.getNextCustomerId();
    }
  }

  saveCustomer() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const customerData = this.customerForm.getRawValue();

    const formData = new FormData();

    formData.append('customerId', customerData.customerId);
    if (this.selectedFile) {
      formData.append('customerImage', this.selectedFile);
    }
    formData.append('customerName', customerData.customerName);
    formData.append('customerEmail', customerData.customerEmail);
    formData.append('customerMobile', customerData.customerMobile);
    formData.append('customerDOB', customerData.customerDOB);
    formData.append('customerCity', customerData.customerCity);

    const request = this.isEditMode
      ? this.http.put(`${this.apiUrl}/updateCustomer/${this.customerId}`, formData)
      : this.http.post(`${this.apiUrl}/addCustomer`, formData);

    request.subscribe({
      next: (result: any) => {
        console.log(result);

        this.toastr.success(this.isEditMode ? 'Customer Updated' : 'Customer Added');

        this.router.navigate(['/customers']);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  onFileChange(event: any) {
  const file = event.target.files[0];

  if (!file) {
    this.selectedFile = null;
    this.customerForm.patchValue({ customerImage: '' });
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    this.toastr.error('Only image files are allowed', 'Invalid File');
    event.target.value = '';
    this.selectedFile = null;
    this.customerForm.patchValue({ customerImage: '' });
    return;
  }

  this.selectedFile = file;

  this.customerForm.patchValue({
    customerImage: file.name,
  });
  
  this.customerForm.get('customerImage')?.markAsTouched();
}

  getNextCustomerId() {
    this.http.get<any>(`${this.apiUrl}/nextCustomerId`).subscribe({
      next: (result) => {
        console.log(result);
        this.customerForm.patchValue({
          customerId: result.customerId,
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getCustomer(customerId:any){
    this.http.get<any>(`${this.apiUrl}/customers/${customerId}`).subscribe({
      next: (result) => {
        console.log(result);
        this.customerForm.patchValue({
          customerId : result.customerId,
          customerImage : result.customerImage,
          customerName : result.customerName,
          customerEmail : result.customerEmail,
          customerMobile : result.customerMobile,
          customerDOB : result.customerDOB.split('T')[0],
          customerCity : result.customerCity
        });
      },
      error: (error)=>{
        console.log(error);
      }
    });
  }
}
