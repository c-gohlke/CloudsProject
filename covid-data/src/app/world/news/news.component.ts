import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news.model';
import { newsService } from '../../services/news.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
})

export class NewsComponent implements OnInit {
  newsList: News[]|undefined|null;

  constructor(public newsService: newsService){
  }

  ngOnInit(): void {
    this.newsService.getNews("world").subscribe((news: any[])=>{
      this.newsList = news;
    });
  }
}
