import React, {useState, useEffect} from 'react';
import './App.css';
import {Card, FormControl, Select,CardContent} from '@material-ui/core'
import { MenuItem } from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table'
import './Table.css'
import  {sortData, prettyPrintStat} from './util'
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import './infobox.css'

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [country_info, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);


  useEffect(()=>{
     fetch('https://disease.sh/v3/covid-19/all')
    .then(res => res.json())
    .then(data =>{
      setCountryInfo(data);
    })
  },[])

  useEffect(()=>{

    const getCountries = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then( (res) => res.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))
        const sortedData = sortData(data)
      setCountries(countries);
      setMapCountries(data);
      setTableData(sortedData);
        
      })
    } 
    getCountries();
  }, []);

  const onCountryChange = async (e) =>{
    const countryCode = e.target.value;

    const url = countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all'
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(res => res.json())
    .then(data =>{
      setCountry(countryCode);
      setCountryInfo(data);
      if(countryCode !== 'worldwide') setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
    })

  }
  console.log(country_info)
  
  
  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>Covid19 Tracker App</h1>
          <FormControl className="app_dropdown">
            <Select variant="outlined" value={country} onChange= {onCountryChange}>
            <MenuItem value="worldwide">Worldwide</MenuItem>
                  {
                    countries.map(country =>(
                      <MenuItem value={country.value}>{country.name}</MenuItem>
                    ))
                  }
            </Select>
          </FormControl>
        </div>
        
        <div className="app_stats">
              < InfoBox
              isRed
              active = {casesType === 'cases'}
              onClick = {e => setCasesType('cases')}
              title="CoronaVirus Cases" 
              cases ={prettyPrintStat(country_info.todayCases)}  
              total={prettyPrintStat(country_info.cases)} />
              
              < InfoBox
              active = {casesType === 'recovered'}
              onClick = {e => setCasesType('recovered')}
              title="Recovered" 
              cases = {prettyPrintStat(country_info.todayRecovered)} 
              total={prettyPrintStat(country_info.recovered)}/>
              
              < InfoBox
              isRed
              active = {casesType === 'deaths'}
              onClick = {e => setCasesType('deaths')}
              title="Deaths" 
              cases = {prettyPrintStat(country_info.todayDeaths)} 
              total={prettyPrintStat(country_info.deaths)}/>
        </div>

        <div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
        </div>
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live cases by country</h3>
          <Table countries = {tableData}/>

          <h3 className = "app__graphTitle">Worldwide new  {casesType}</h3>
          <LineGraph className="app_graph" casesType = {casesType}/>
          
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
