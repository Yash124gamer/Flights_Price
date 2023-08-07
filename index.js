const express = require('express')
const app = express()
const axios = require('axios')

const config = {                            //Headers For Sky Scrapper API
  headers:{
    "X-RapidAPI-Key": "dc05173acbmsh1341c64af3e3fc3p117f68jsn02e0655daebf",
    "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
  }
};
let Result = [];

app.listen(8080)
console.log("Server Running on 8080")
app.use(express.json())

app.post('/flightPrice',async(req, res)=>{

  const {origin , destination ,date} = req.body;                         //Destructuring the origin Destination and Date from the Request's Body

  if(!origin || !destination || !date)                                   //If Any Parametrs is not given it will give Errors
    res.status(400).json({error : "Please Provide All the Details"})
  else{                                                                 
    const {originId, originEntityId} = await cityId(origin,"origin")
    const {destinationId, destinationEntityId} = await cityId(destination,"destination")
    
    //Now getting Details For Flights According to Given Data
    try{
      const response = await axios.get(`https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights?originSkyId=${originId}&destinationSkyId=${destinationId}&originEntityId=${originEntityId}&destinationEntityId=${destinationEntityId}&date=${date}&adults=1&currency=INR`,config)
      for(let i=0;i<response.data.data.context.totalResults;i++){
        const item = response.data.data.itineraries[i];
        const price = item.price.formatted;                              //Extracting the Price 
        const airlines = item.legs[0].carriers.marketing[0].name;        //Extracting the Name of the Airline Service
        const keyValueObject = { [airlines]: price };                    //Making the name and Price as Object 
        Result.push(keyValueObject);                                     //Storing thme in a Array       
      }
      res.send({Results:Result});                                        //Sending the Array With all the Price as the Response  
    }
    catch(error){
      console.log(error)
    }
  }
})



async function cityId(city,type) {
  try {
    const response = await axios.get(`https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport?query=${city}`, config);
    if(type==="origin")
      return {originId:response.data.data[0].skyId,originEntityId:response.data.data[0].entityId};
    else  
      return {destinationId:response.data.data[0].skyId,destinationEntityId:response.data.data[0].entityId};
  } catch (error) {
    console.log(error);
    throw error; // Rethrow the error to be caught by the caller
  }
}
