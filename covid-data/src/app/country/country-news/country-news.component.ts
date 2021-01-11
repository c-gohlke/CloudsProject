import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { News } from '../../models/news.model';
import { newsService } from '../../services/news.service';

@Component({
  selector: 'app-country-news',
  templateUrl: './country-news.component.html',
})

export class CountryNewsComponent implements OnInit {
  newsList: News[]|undefined|null;
  public country: string = ""

  constructor(public newsService: newsService, private route: ActivatedRoute){
  }

  ngOnInit(): void {
    this.country = this.route.snapshot.paramMap.get("country")!
    this.newsService.getNews(this.country).subscribe((news: any[])=>{
      this.newsList = news;
    });
  }
}
