
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
			return this.firestore.collection("countries").doc(news!.country)
			.collection("news").doc(news!.id).set({
				description: news!.description,
				date: news!.date,
				user: news!.user,
				country: news!.country
			});
		}
		
		getNews(countryList: string[]){
			let promises: Array<Promise<any>> = []
			for (let country of countryList){
				promises.push(this.firestore.collection("countries").doc(country)
				.collection("news").get().toPromise())
			}
			return Promise.all(promises).then((countryNewsList)=>{
				let news: News[] = []
				for (let countryNews of countryNewsList){
					countryNews.forEach((newsDoc:any)=>{
						let newsData = newsDoc.data();
						newsData.date = newsData.date.toDate()
						news.push(newsData)
					})
				}
				return news
			}) 
		}
}
