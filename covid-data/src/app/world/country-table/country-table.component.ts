import { Component, OnInit, ViewChild } from '@angular/core';
import { newsService } from '../../services/news.service';
import { countryListService } from '../../services/country-list.service';
import { countryDataService } from '../../services/country-data.service';
import { userService } from '../../services/user.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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
    let promises: Array<Promise<any>> = [];
    let COUNTRY_DATA: any = []

    console.log("Loading live data for each country in countryList")
    promises.push(this.worldDataService.loadLiveData(this.countryList!).then((liveCountryDataList : any)=>{
      for (let country of this.countryList!){
        let liveCountryData: LiveData = liveCountryDataList[country];
        //if country not in list of api/summary, returns undefined
        if(liveCountryData){
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
    }));

    Promise.all(promises).then(()=>{
      this.dataSource = new MatTableDataSource(COUNTRY_DATA);
      this.dataSource.sort = this.sort!;
      console.log("Country Live Data Loaded")
    })
  }
}