export class DailyCountryData{
    id: string|undefined; 
    totalConfirmed: number|null|undefined;
    totalRecovered: number|null|undefined;
    totalDeaths: number|null|undefined;
    lastUpdated: Date|null|undefined

    constructor() {}
}