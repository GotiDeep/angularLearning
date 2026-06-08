import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  LoginForm !: FormGroup;
  
  constructor(
    private auth:Auth,
    private rout:Router,
    private toastr : ToastrService,
    private fb : FormBuilder
  ){}


  ngOnInit(): void {
    this.LoginForm = this.fb.group({
      email: ['',Validators.required],
      password:['',Validators.required]
    })
  }
  

  login(){
    if(this.LoginForm.invalid){
      this.toastr.info("Required Email Or Password");
    }
    else{
      this.auth.login(this.LoginForm.value)
  .subscribe((res:any)=>{
    localStorage.setItem(
      "token",
      res.token
    );

    this.toastr.success('Login Success','Welcome')

    this.rout.navigate(['/styleListing']);
    }, (err) => {
      console.log(err);
      this.toastr.error('Login Failed','error')
    });
    }
}
}

