import React, { Component } from 'react';

class GoogleMap extends Component {
  componentDidMount() {
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
    new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: -34.397, lng: 150.644 },
      zoom: 8,
    });
  };

  render() {
    return <div id="map" style={{ height: '100vh', width: '100%' }} />;
  }
}

export default GoogleMap;
