import React, { Component } from 'react';

class SmallMap extends Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {
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
      center: { lat: this.props.lat, lng: this.props.lng },
      zoom: 17,
      fullscreenControl: false,
      mapTypeControl: false,
      styles: [
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    const marker = new window.google.maps.Marker({
      position: { lat: this.props.lat, lng: this.props.lng },
      map: map,
      title: this.props.name
    });
  };

  render() {
    return <div id="map" style={{ height: '100%', width: '100%' }} />;
  }
}

export default SmallMap;
