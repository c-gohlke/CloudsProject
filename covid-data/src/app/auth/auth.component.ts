import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { userService } from '../services/user.service';


@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {    
	constructor(public userService: userService){}
	ngOnInit(): void {
	}
}