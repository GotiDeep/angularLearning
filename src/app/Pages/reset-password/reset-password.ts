import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {

  resetForm !: FormGroup;

  token: string  = "";

  apiUrl = "http://localhost:3000/api" 

  constructor(
    private fb : FormBuilder,
    private http : HttpClient,
    private router : Router,
    private toast : ToastrService,
    private activeRoute : ActivatedRoute
  ) {}

  ngOnInit() {
    this.resetForm = this.fb.group({
      newPassword : ['',[Validators.required,Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword : ['',[Validators.required]]
    })

    this.activeRoute.queryParams.subscribe((params) => {
      this.token = params['token'];
    })
    console.log(this.token);
  }


  resetPassword() {
    if(this.resetForm.invalid) {
      this.toast.warning('Please Fill All The Fields', 'Warning')
    }
    else{

        const resetFormData = {
        token : this.token,
        newPassword : this.resetForm.value.newPassword,
        confirmPassword : this.resetForm.value.confirmPassword
      }

      this.http.post<any>(`${this.apiUrl}/resetPassword`, resetFormData).subscribe({
        next : (res) => {
          this.toast.success(`${res.message}`, 'Success');
          this.resetForm.reset();
          this.router.navigate(['/login']);
        },
        error : (err) => {
          this.toast.error(`${err.error.message}`, 'Error');
        }
      })

    }

  }

}
