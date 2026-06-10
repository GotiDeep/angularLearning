import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink,Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forget-password',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css',
})
export class ForgetPassword implements OnInit{
  ForgetForm!: FormGroup;

  apiUrl = "http://localhost:3000/api"

  constructor(
    private fb : FormBuilder,
    private toast : ToastrService,
    private http : HttpClient,
    private router : Router
  )
  { }

  ngOnInit(): void {
    this.ForgetForm = this.fb.group({
      email : ['',Validators.required]
    })
  }

  sendLink(){
    if(this.ForgetForm.invalid){
      this.toast.error("Please Enter Email to Send Link ");
      return;
    }

    const email = this.ForgetForm.value;

    console.log(email);

    this.http.post(`${this.apiUrl}/sendResetLink`,email)
    .subscribe({
      next : (res : any) => {
        this.toast.success("Link Sent Successfully");
      },
      error : (err : any) => {
        this.toast.error(err.error.message);
      }
    })
    
  }
}
