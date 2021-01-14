export class LiveData{
    activeConfirmed: number|undefined
    deathRate: number|undefined; 
    lastUpdated: Date|undefined;
    newConfirmed: number|undefined;
    newDeaths: number|undefined;
    newRecovered: number|undefined;
    recoveryRate: number|undefined;
    totalConfirmed: number|undefined;
    totalDeaths: number|undefined;
    totalRecovered: number|undefined;
    constructor() {
    }
}