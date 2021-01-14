import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class userService {
  public user: User | undefined | null;
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

  async signInWithGoogle(): Promise<void>{
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid!: credentials.user?.uid,
      displayName: credentials.user?.displayName,
      email: credentials.user?.email
    };
    this.updateUserData()
  }

  private updateUserData(): void{
    this.firestore.collection("users").doc(this.user?.uid).set({
      uid: this.user?.uid,
      displayName: this.user?.displayName,
      email: this.user?.email
    }, {merge: true})
    localStorage.setItem("user", JSON.stringify(this.user));
  }

  getUser(): User{
    if(this.user == null && this.userSignedIn()){
      this.user = JSON.parse(localStorage.getItem("user")||'{}');
    }
    return this.user!;
  }

  userSignedIn(): boolean{
    return localStorage.getItem("user") != null;
  }

  signOut(): void{
    this.afAuth.signOut();
    localStorage.removeItem("user");
    this.user = null;
  }

  addNewsAuthorized(): boolean{
    let user: User|null|undefined = JSON.parse(localStorage.getItem("user")||'{}');
    return (["clement.gohlke@gmail.com"].includes(user?.email!) );
  }
}