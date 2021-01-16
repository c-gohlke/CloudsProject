
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { News } from '../models/news.model'

@Injectable({
  providedIn: 'root'
})
export class newsService {
  constructor(
    public firestore: AngularFirestore,
    public httpClient: HttpClient){}

    addNews(news?: News){
      this.firestore.collection("countries").doc(news!.country)
      .collection("news").doc(news!.id).set({
        description: news!.description,
        date: news!.date,
        user: news!.user
      });
    }
    getNews(country: string){
      return this.firestore.collection("countries").doc(country)
      .collection("news").valueChanges()
    }
}
