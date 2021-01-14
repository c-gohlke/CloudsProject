
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

    async loadCountriesList(){
        const doc = await this.firestore.collection("countries").doc("countryList").get().toPromise();
        if (doc.get("lastUpdated") && new Date().getTime() - doc.get("lastUpdated").toDate().getTime() > 1000 * 3600 * 24){
            return doc.get("slugs");
        } else {
            const httpOptions = {
                headers: new HttpHeaders({ "Content-Type": "application/json"})
            };
            let countryObjList: any = await this.httpClient.get("https://api.covid19api.com/countries", httpOptions).toPromise()
            let countrySlugList = [];
            countrySlugList.push("world")
            for (let countryObj of countryObjList) {
                countrySlugList.push(countryObj.Slug);
            }
            this.firestore.collection("countries").doc("countryList").set({slugs: countrySlugList}, {merge: true})
            this.firestore.collection("countries").doc("countryList").set({lastUpdated: new Date()}, {merge: true})
            // localStorage.setItem("countryList", JSON.stringify(countrySlugList))
            return countrySlugList
        }
    }    
}
