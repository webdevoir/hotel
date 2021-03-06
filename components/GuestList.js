import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ListView,
  RefreshControl,
  TextInput,
  TouchableHighlight,
  AsyncStorage,
  nativeEvent,
  event
} from 'react-native';

var HotelAdminService = require('./services.js');
var ProgressBar = require('ProgressBarAndroid');
import SearchBar from './searchBar.android.js';
import Dashboard from './Dashboard.js';
import { filter, indexOf, invert, findKey,search,} from 'lodash-node';


import { Actions } from 'react-native-router-flux';

class GuestList extends Component {

  constructor(props) {
    super(props);


    this.state = {
       dataLoaded:false,
       dataSource: new ListView.DataSource({
         rowHasChanged: (row1, row2) => row1 !== row2,
       }),
       refreshing: false,
       progress:1,

    };
     this.renderHotel = this.renderHotel.bind(this);
     this.getGuestList=HotelAdminService.getGuestList.bind(this);
     this.getOccupiedItems=HotelAdminService.getOccupiedItems.bind(this);
     this.getGuestStats=HotelAdminService.getGuestStats.bind(this);
     this.setSearchText=this.setSearchText.bind(this)

  }

  componentDidMount() {
   HotelAdminService.getGuestList.bind(this)();

  }



  renderLoadingView() {
    return (
      <View style={styles.loadingContainer}>

          <ProgressBar progress={this.state.progress} />

      </View>
    );
  }





  _onRefresh() {


   this.setState({refreshing: true});

    let URL= 'http://checkinadvance.com/'+ 'api/HotelAdmin/GetGuests?key=' + this.props.hotel;

    AsyncStorage.getItem('access_token').then((value) =>{
      fetch(URL, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + value
      }
       })
       .then((response) => response.json())
       .then((responseData) => {

         console.log(responseData);
         this.setState({
           dataSource:this.state.dataSource.cloneWithRows(responseData),
         });
      }).then(() => this.setState({refreshing: false})).done();
    })



 }





  render() {
    //console.log("Props in GuestList render");
  //  console.log(this.props);

    if (!this.state.dataLoaded) {
      return this.renderLoadingView();
   }
  return (
        <View style={styles.viewContainer} >
        <TextInput
        value={this.state.searchText}
        onChange={this.setSearchText.bind(this)}
        style={styles.searchBar}
        placeholder='Search' />
            <ListView dataSource={this.state.dataSource} renderRow={this.renderHotel} style={styles.listView} refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}/>}/>

        </View>
  );
}





 onHotelClick(hotel){
  let name= hotel.lastName;
  let salutation=hotel.salutation;
  let notice={
    Name:name ,
    Salutation:salutation,
}

   alert(JSON.stringify(notice));
 }

 renderHotel(hotel) {
   var icon;
   if(hotel.salutation != null){if(hotel.salutation.toLowerCase() == "mr" ){
     icon= require('./images/mr.png');
   }
   else if(hotel.salutation.toLowerCase() == ("ms"|| 'mrs')){
       icon =require('./images/mrs.png');

   }
   else{
        icon =require('./images/icon.png');
   }}
   else{
     icon =require('./images/icon.png');

   }


   return (

     <TouchableOpacity onPress={()=>this.onHotelClick(hotel)}>

     <View style={styles.container}>
     <Image
       source={icon}
       style={styles.thumbnail}
     />


       <View style={styles.rightContainer}>
         <Text style={styles.title}>{hotel.firstName + " " + hotel.lastName}</Text>
         <Text style={styles.year}>Click for More Info!</Text>
       </View>
     </View>
     </TouchableOpacity>

   );
 }

 setSearchText(event) {
 let searchText = event.nativeEvent.text;
 this.setState({searchText:searchText});

let key=this.props.hotel
let URL='http://checkinadvance.com/' + 'api/HotelAdmin/GetGuests?key=' + key
AsyncStorage.getItem('access_token').then((value) =>{
  fetch(URL, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + value
  }
   })
   .then((response) => response.json())
   .then((responseData) => {

     console.log(responseData);
     let filteredData = this.filterNotes(searchText, responseData);
     console.log('filteredData');
     console.log(filteredData);
     this.setState({
       dataSource: this.state.dataSource.cloneWithRows(filteredData),
       rawData: responseData,
     });



   }).done();
})
}

filterNotes(searchText, notes) {
  let text = searchText.toLowerCase();

  return filter(notes, (n) => {
     //console.log('inside filternotes')
   // console.log(n.userName)
    let note = n.firstName.toLowerCase() + " " + n.lastName.toLowerCase();
    if(note.search(text) !== -1){return n};
  });
}


}








const styles = StyleSheet.create({
  viewContainer: {
     flex: 1,
     flexDirection: 'column',
  },

  container: {
     flex: 1,
     flexDirection: 'row',
     justifyContent: 'center',
     alignItems: 'center',

   },
   loadingContainer: {
       flex:1,
       backgroundColor: '#F5FCFF',
       marginTop: 56,
       alignItems:'stretch',
       justifyContent:'center'

   },

  thumbnail: {
    width: 60,
    height: 81,
  },
  rightContainer:{
    flex:1,

  },
  title:{
    fontSize:20,
    textAlign: 'center',
  },
  year: {
    textAlign: 'center'
  },
 box:{
   textAlign: 'center',
   fontSize: 16
 },
 listView: {
   paddingTop: 21,
   backgroundColor: '#F5FCFF',
 },
 searchBar:{
   backgroundColor: '#f8fcff',
    borderBottomColor: 'black',
 }


});




//AppRegistry.registerComponent('SecureView', () => SecureView);

module.exports = GuestList;
