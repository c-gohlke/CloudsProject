import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { News } from '../../models/news.model';
import { newsService } from '../../services/news.service';
import { countryListService } from '../../services/country-list.service';
import { countryDataService } from '../../services/country-data.service';
import { userService } from '../../services/user.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';
import { worldDataService } from 'src/app/services/world-data.service';
import { LiveData } from 'src/app/models/live-data.model';


@Component({
  selector: 'app-country-table',
  templateUrl: './country-table.component.html',
})
export class CountryTableComponent implements OnInit {
  displayedColumns: string[] = ['Country', 'NewCases', 'TotalCases', 'NewRecoveries', 'TotalRecoveries', 'NewDeaths', 'TotalDeaths'];
  dataSource = new MatTableDataSource();
  countryList: string[]|undefined;

  @ViewChild(MatSort) sort: MatSort|undefined;

  constructor(private newsService: newsService, public countryListService: countryListService, public userService: userService, public countryDataService: countryDataService, public worldDataService: worldDataService) {}
  async ngOnInit(): Promise<void> {
    this.countryList = await this.countryListService.loadCountriesList()

    let problemList: any[] = ["world", "ala-aland-islands", "tokelau", "northern-mariana-islands", "guernsey", "saint-helena", "cook-islands",
    "pitcairn", "micronesia", "hong-kong-sar-china", "guadeloupe", "saint-pierre-and-miquelon", "kiribati", "saint-barthélemy", "tonga", "turkmenistan",
    "french-guiana", "french-southern-territories", "us-minor-outlying-islands", "mayotte", "gibraltar", "cayman-islands", "falkland-islands-malvinas",
    "puerto-rico", "american-samoa", "christmas-island", "faroe-islands", "anguila", "guam", "heard-and-mcdonald-islands", "aruba", "niue",
    "norfolk-island", "turks-and-caicos-islands", "bouvet-island", "saint-martin-french-part", "palau", "wallis-and-futuna-islands", "new-caledonia",
    "british-virgin-islands", "greenland", "french-polynesia", "cocos-keeling-islands", "martinique", "nauru", "korea-north", "british-indian-ocean-territory",
    "tuvalu", "netherlands-antilles", "isle-of-man", "antarctica", "anguilla", "virgin-islands", "jersey", "bermuda", "south-georgia-and-the-south-sandwich-islands",
    "montserrat", "svalbard-and-jan-mayen-islands"
  ]

    //some countries are in list of country slugs, but are not in Countries data array given by API
    for (let country of problemList){
      delete this.countryList![country];
    }

    let COUNTRY_DATA: any = []

    console.log("Loading live data for each country in countryList")
    for (let country of this.countryList!){
      if (!problemList.includes(country)){
        let liveCountryData: LiveData = await this.worldDataService.loadLiveData(country)
        COUNTRY_DATA.push({
          Country: country,
          NewCases: liveCountryData.newConfirmed,
          TotalCases: liveCountryData.totalConfirmed,
          NewRecoveries: liveCountryData.newRecovered,
          TotalRecoveries: liveCountryData.totalRecovered,
          NewDeaths: liveCountryData.newDeaths,
          TotalDeaths: liveCountryData.totalDeaths
        })
      }
    }

    this.dataSource = new MatTableDataSource(COUNTRY_DATA);
    this.dataSource.sort = this.sort!;
    console.log("Country Live Data Loaded")
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort!;
  }
}