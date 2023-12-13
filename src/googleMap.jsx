import React, { Component } from 'react';

class GoogleMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
    };
  }

  async componentDidMount() {
    const response = await fetch('http://localhost:80/user/locations');
    const locations = await response.json();
    this.setState({ locations });
    this.loadMap();
  }

  loadMap() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDMkFQwQJ8rAnTHWmDwlZ6louIAHVqzvqw&callback=initMap`;
    script.async = true;
    window.initMap = this.initMap;
    document.body.appendChild(script);
  }

  initMap = () => {
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: 22.30778, lng: 114.18722 },
      zoom: 11,
      // styles: [
      //   {
      //     featureType: 'poi',
      //     stylers: [{ visibility: 'off' }],
      //   },
      //   {
      //     featureType: 'transit',
      //     elementType: 'labels.icon',
      //     stylers: [{ visibility: 'off' }],
      //   },
      // ],
    });

    this.state.locations.forEach((location) => {
      if(typeof(location.latitude) === "number" && typeof(location.longitude) === "number"){
        const marker = new window.google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: map,
          title: location.name,
          // label: location.name,
        });
        console.log(location.name);
        // marker.addListener('click', () => {
        //   window.location.href = location.url;
        // });
      }
    });
  };

  render() {
    return <div id="map" style={{ height: '90vh', width: '100%' }} />;
  }
}

export default GoogleMap;
