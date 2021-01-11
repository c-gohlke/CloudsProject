import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { News } from '../../models/news.model';
import { newsService } from '../../services/news.service';
import { countryListService } from '../../services/country-list.service';
import { userService } from '../../services/user.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';

const COUNTRY_DATA: any = [
  {Country: "A", NewCases: 'EEE', TotalCases: 100, NewRecoveries: 'H', TotalRecoveries: 'D', NewDeaths: 'A', TotalDeaths: 'A'},
  {Country: "B", NewCases: 'DDD', TotalCases: 99, NewRecoveries: 'H', TotalRecoveries: 'D', NewDeaths: 'A', TotalDeaths: 'A'},
  {Country: "C", NewCases: 'AAA', TotalCases: 105, NewRecoveries: 'H', TotalRecoveries: 'D', NewDeaths: 'A', TotalDeaths: 'A'}
];

@Component({
  selector: 'app-country-table',
  templateUrl: './country-table.component.html',
})
export class CountryTableComponent implements OnInit {
  displayedColumns: string[] = ['Country', 'NewCases', 'TotalCases', 'NewRecoveries', 'TotalRecoveries', 'NewDeaths', 'TotalDeaths'];
  dataSource = new MatTableDataSource(COUNTRY_DATA);

  @ViewChild(MatSort) sort: MatSort|undefined;

  constructor(private newsService: newsService, public countryListService: countryListService, public userService: userService) {}
  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(COUNTRY_DATA);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort!;
  }
}