
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class countryListService {
  constructor(
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

    async checkCountriesList(): Promise<boolean>{
        const doc = await this.firestore.collection("countries").doc("countryList").get().toPromise();
        if (!doc.get("lastUpdated")) {
            return true;
        }
        // if lastUpdate happened more than a day ago, fetch new data
        else if (new Date().getTime() - doc.get("lastUpdated").toDate().getTime() > 1000 * 3600 * 24) {
            return true;
        }
        else {
            return false;
        }
    }

    getCountriesList(){
    const httpOptions = {
        headers: new HttpHeaders({ "Content-Type": "application/json"})
    };

    return this.httpClient.get("https://api.covid19api.com/countries", httpOptions)
    }

    async updateCountriesList(countryList: string[]): Promise<void>{
        this.firestore.collection("countries").doc("countryList").set({slugs: countryList}, {merge: true})
        this.firestore.collection("countries").doc("countryList").set({lastUpdated: new Date()}, {merge: true})
        return
    }

    async loadCountriesList(){
        const doc = await this.firestore.collection("countries").doc("countryList").get().toPromise();
        return doc.get("slugs");
    }    
}
