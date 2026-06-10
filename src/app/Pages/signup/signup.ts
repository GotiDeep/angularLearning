import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router , RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone : true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  users = {
    username : '',
    email    : '',
    mobile   : '',
    password : '',
    confpass : '',
  }

  constructor(
    private auth: Auth,
    private router: Router,
    private toastr: ToastrService
  ) {}

  signup() {
    // Frontend pe bhi check karo
    if (this.users.password !== this.users.confpass) {
      this.toastr.error('Passwords do not match', 'Error');
      return;
    }

    this.auth.signup(this.users).subscribe({
      next: (res: any) => {
        this.toastr.success('Account Created! Please login.', 'Success');
        this.router.navigate(['/login']);  // Signup ke baad login page pe jaao
      },
      error: (err) => {
        // Backend se aaya specific message dikhao
        const msg = err.error?.message || 'Signup Failed';
        this.toastr.error(msg, 'Error');
      }
    });
  }
}

