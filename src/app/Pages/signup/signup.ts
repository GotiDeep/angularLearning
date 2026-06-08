import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router , RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone : true,
  imports: [CommonModule,FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  users = {
  username : '',
  email : '',
  mobile : '',
  password : '',
  confpass : '',
  }

  constructor(
    private auth:Auth,
    private router:Router,
    private toastr :ToastrService
  ){}

  signup(){
    this.auth.signup(this.users).subscribe((res:any)=>{
        console.log(res);
        this.toastr.success('Account Created Successfully...','Success');
        this.router.navigate(['/showdata']);
    }, (err) => {
        console.log(err);
        this.toastr.error("Signup Failed","Error")
    });
  }
}
