import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { News } from '../../models/news.model';
import { newsService } from '../../services/news.service'
import { countryListService } from '../../services/country-list.service'
import { userService } from '../../services/user.service'

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
})
export class AddNewsComponent implements OnInit {
  date: any;
  description: string|undefined;
  country: string = "world";
  public countries: String[]|undefined;

  constructor(private newsService: newsService, public countryListService: countryListService, public userService: userService) {}
  async ngOnInit(): Promise<void> {
    this.countries = await this.countryListService.loadCountriesList();
    this.countries!.sort();
    this.countries!.unshift("world");
  }

  addNews(){
    let news: News = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      date: new Date(this.date),
      description: this.description,
      user: this.userService.getUser()?.displayName!,
      country: this.country
    }
    this.newsService.addNews(news);

    this.date = undefined;
    this.description = undefined;
    this.country = "world";
  };

  onSelectChange(selectedCountry: any){
    this.country = selectedCountry;  
  }
}