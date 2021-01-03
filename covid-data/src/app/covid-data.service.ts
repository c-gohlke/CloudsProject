import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.model';
import { Router } from '@angular/router';
import { CovidData } from './covid-data.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})

export class covidDataService {
  private user: User | undefined | null;
  private DATA_ROUTE = "https://api.covid19api.com/summary"

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
    localStorage.setItem("user", JSON.stringify(this.user));

    this.updateUserData()
    this.router.navigate(["covid-data"]);
  }

  private updateUserData(): void{
    this.firestore.collection("users").doc(this.user?.uid).set({
      uid: this.user?.uid,
      displayName: this.user?.displayName,
      email: this.user?.email
    }, {merge: true})
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
    this.router.navigate(["signin"]);
  }

  loadCovidData(): Observable<CovidData>{
    return this.firestore.collection("covid_data").doc("global").valueChanges().pipe(
      map(
        (covidData: any) => {
          let newData: CovidData
          if(covidData){
            newData = {
              activeConfirmed: covidData["activeConfirmed"],
              newConfirmed: covidData["newConfirmed"],
              deathRate: covidData["deathRate"],
              lastUpdated: covidData["lastUpdated"],
              newDeaths: covidData["newDeaths"],
              newRecovered: covidData["newRecovered"],
              recoveryRate: covidData["recoveryRate"],
              totalConfirmed: covidData["totalConfirmed"],
              totalDeaths: covidData["totalDeaths"],
              totalRecovered: covidData["totalRecovered"]
            };
          }
          else{
            newData = {
              activeConfirmed: -1,
              newConfirmed: -1,
              deathRate: -1,
              lastUpdated: null,
              newDeaths: -1,
              newRecovered: -1,
              recoveryRate: -1,
              totalConfirmed: -1,
              totalDeaths: -1,
              totalRecovered: -1
            };
          }
        return newData;
      })
    );
  }

  checkUpdateData(): Observable<boolean>{
    return this.firestore.collection("covid_data").doc("global").valueChanges().pipe(
      map(
        (covidData: any) => {
          // if lastUpdate happened more than a day ago, fetch new data
          if(covidData){
            let fetchData: boolean = (new Date().getTime() - covidData["lastUpdated"].toDate().getTime())>1000*3600*24;
            if(!covidData["lastUpdated"] || fetchData){
              console.log("fetching new data");
              return true;
            }
            else{
              return false;
            }
          }
          else{
            return true;
          }
        }));
  }

  updateData(newData: CovidData){
    this.firestore.collection("covid_data").doc("global").set({
      activeConfirmed: newData["activeConfirmed"],
      deathRate: newData.deathRate,
      lastUpdated: newData.lastUpdated,
      newConfirmed: newData.newConfirmed,
      newDeaths: newData.newDeaths,
      newRecovered: newData.newRecovered,
      recoveryRate: newData.recoveryRate,
      totalConfirmed: newData.totalConfirmed,
      totalDeaths: newData.totalDeaths,
      totalRecovered: newData.totalRecovered,      
    }, {merge: true})
  }

  getCovidData(){
    console.log("updateData called")
    const httpOptions = {
      headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    return this.httpClient.get(this.DATA_ROUTE, httpOptions)
  }

  private handleError(error: HttpErrorResponse): Observable<never>{
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code. The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // return an observable with a user-facing error message
    return throwError(error);
  }
}
