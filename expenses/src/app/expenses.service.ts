import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from './user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class ExpensesService {
  private user!: User;
  constructor(private afAuth: AngularFireAuth, private router: Router) { 

  }

  async signInWithGoogle(){
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid: credentials.user!.uid,
      displayName: credentials.user!.displayName,
      email: credentials.user!.email
    };
    this.router.navigate(["expenses"]);
  }
}
