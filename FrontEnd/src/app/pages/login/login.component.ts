import { Component } from '@angular/core';
import { FormInputComponent } from '../../component/form-input/form-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormInputComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

}
