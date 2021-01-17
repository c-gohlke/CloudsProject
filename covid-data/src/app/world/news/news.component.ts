import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news.model';
import { newsService } from '../../services/news.service';
import { userService } from '../../services/user.service';
import { countryListService } from '../../services/country-list.service';

@Component({
	selector: 'app-news',
	templateUrl: './news.component.html',
})
export class NewsComponent implements OnInit {
	date: any;
	description: string|undefined;
	selectedCountry: string = "world";
	newsList: News[] = [];
	countryList: string[] = [];

	constructor(public newsService: newsService, public userService: userService, public countryListService: countryListService){
	}

	ngOnInit(): void {
		this.countryListService.loadCountriesList().then((countryList)=>{
			this.countryList = countryList
			this.countryList.sort();
			countryList.unshift("world")
			this.newsService.getNews(countryList).then((news: any[])=>{
				this.newsList = news;
				console.log("news loaded")
			});
		})
	}

	addNews(){
		let news: News = {
		  id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
		  date: new Date(this.date),
		  description: this.description,
		  user: this.userService.getUser()?.displayName!,
		  country: this.selectedCountry
		}
		this.newsList.push(news)
		this.newsService.addNews(news);
		this.date = undefined;
		this.description = undefined;
	  };
	
	  onSelectChange(selectedCountry: any){
		this.selectedCountry = selectedCountry;  
	  }
}
