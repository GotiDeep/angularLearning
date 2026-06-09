import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  LoginForm !: FormGroup;

  constructor(
    private auth: Auth,
    private rout: Router,
    private toastr: ToastrService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.LoginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  login() {
    if (this.LoginForm.invalid) {
      this.toastr.info("Required Email Or Password");
      return;
    }

    this.auth.login(this.LoginForm.value).subscribe({
      next: (res: any) => {

        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("permissions", JSON.stringify(res.permissions));

        this.toastr.success('Login Success', `Welcome ${res.user.username}!`);
        if (res.user.is_super_role) {
          this.rout.navigate(['/styleListing']);
        } else {
          this.rout.navigate(['/styleListing']);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err.error?.message || 'Login Failed', 'Error');
      }
    });
  }
}

