import ReactDOM from 'react-dom/client'
import React, { Component } from 'react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Switch, Link, useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import GoogleMap from './googleMap';
import SmallMap from './smallMap';
// import { useMatch, useParams, useLocation } from 'react-router-dom';
function render_fun(result) {
  document.open();
  document.write(result);
  document.close();
}
function render_login(result) {
  let error = '';
  let render_loc = '';
  if (result[0] == "Success") {
    if (result[2] == 'user') {
      error = "";
      render_loc = '/user';
    } else {
      error = "";
      render_loc = '/admin';
    }
  } else {
    error = result[1];
    render_loc = '/login';
  }

  let render_msg = `
    <html>
      <head>
        <title>Login_information</title>
      </head>
      <body>
        <h1> Login ${result[0]}!</h1>
        <h1>${error}</h1>
        <h2>this page is generated by the server </h2>
        <p>Return you to ${render_loc} page</p>
      </body>
    </html>
      `;

  document.open();
  document.write(render_msg);
  document.close();

  const res = setTimeout(() => { window.location.replace(render_loc) }, 3000);

}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current_login: '',
      current_username: '',
      current_usertype: ''
    };

  }
  async componentDidMount() {

    const response = await fetch('http://localhost:80/load');
    const result = await response.text();
    const result_current = result.split("**");
    if (result_current[0] == "Valid") {
      this.setState({ current_login: 'Valid', current_username: result_current[2], current_usertype: result_current[1] });
    } else {
      this.setState({ current_login: 'Invalid', current_username: 'Invalid', current_usertype: 'Invalid' });
    }
  }

  render() {
    let i = '';
    if (this.state.current_login == "Valid") {
      i = 'NONE';
    } else {
      i = '';
    }
    return (
      <BrowserRouter>
        <div>
          <Navigation value={i} name={this.state.current_username} />

          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Sign_up />} />
            <Route path="/user/*" element={<User value={this.state.current_usertype} />} />
            <Route exact path="/admin" element={<Admin value={this.state.current_usertype} />} />
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}
//Navbar
class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current_username: '',
      current_usertype: ''
    };
  }

  async handSignOut(event) {
    event.preventDefault();
    const response = await fetch('http://localhost:80/logout');
    const result = await response.text();
    render_fun(result);
  }
  render() {
    let i = this.props.value;
    let j = "dsds";
    if (i == "NONE") {
      j = '';
    }

    if (i == "") {
      j = 'NONE';
    }

    return (

      <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">Culture.io </span>

          <div className="col-md-3 text-end" id="Guest_nav" style={{ display: i }}>
            <button type="button " className="btn btn-outline-primary me-2 bg-white" onClick={(e) => window.location.href = '/login'}>Log In</button>
            <button type="button" className="btn btn-primary" onClick={(e) => window.location.href = '/signup'}>Sign Up </button>
          </div>


          <div className=" text-end" id="Guest_nav" style={{ display: j }}>
            <div>
              <span className="navbar-text me-4">
                Welcome! {this.props.name}
              </span>
              <button type="button" className="btn btn-secondary" onClick={this.handSignOut}> Log Out </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }
};
//home page
class Home extends React.Component {
  render() {
    return (
      <div className="px-4 pt-5 my-5 text-center border-bottom">
        <h1 className="display-4 fw-bold text-body-emphasis">Culture.io(暫定)</h1>
        <div className="col-lg-6 mx-auto">
          <p className="lead mb-4">Welcome to our website, Please log in to use our app.
          </p>
          <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
            <button type="button" className="btn btn-primary btn-lg px-4 me-sm-3" onClick={(e) => window.location.href = '/login'}>Log In</button>
            <button type="button" className="btn btn-outline-secondary btn-lg px-4" onClick={(e) => window.location.href = '/signup'}>Sign Up</button>
          </div>
        </div>
      </div>
    );
  };
}
//login page
class Login extends React.Component {

  render() {
    return (
      <div class="vh-100">
        <Login_form />
      </div>
    );
  };
}
class Login_form extends React.Component {
  constructor(props) {
    super(props);
    this.state = { login_username: 'w', login_password: '', login_type: '' };
    this.login_handleChange_username = this.login_handleChange_username.bind(this);
    this.login_handleChange_password = this.login_handleChange_password.bind(this);
    this.login_handleChange_type = this.login_handleChange_type.bind(this);
    this.login_handleSubmit = this.login_handleSubmit.bind(this);
  }

  login_handleChange_username(event) {
    this.setState({ login_username: event.target.value });

  }
  login_handleChange_password(event) {
    this.setState({ login_password: event.target.value });
  }
  login_handleChange_type(event) {
    this.setState({ login_type: event.target.value });
  }
  async login_handleSubmit(event) {
    this.render = "return(<Home/>);";
    event.preventDefault();
    const response_login = await fetch('http://localhost:80/login?' + 'username=' + this.state.login_username + '&password=' + this.state.login_password + '&type=' + this.state.login_type);
    const result = await response_login.text();
    const result_login = result.split("**");
    render_login(result_login);


  }

  render() {
    return (
      <form id="login_form" onSubmit={this.login_handleSubmit}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-2-strong" style={{ borderradius: "1rem" }}>
                <div className="card-body p-5 text-center">
                  <h3 className="mb-5">Log in</h3>

                  <div className="form-outline mb-4">
                    <input type="text" name="username" className="form-control form-control-lg" onChange={this.login_handleChange_username} />
                    <label className="form-label" htmlFor="typeEmailX-2">Username</label>
                  </div>

                  <div className="form-outline mb-4">
                    <input type="password" id="typePasswordX-2" className="form-control form-control-lg" name="password" onChange={this.login_handleChange_password} />
                    <label className="form-label" htmlFor="typePasswordX-2" >Password</label>
                  </div>
                  <div class="form-outline mb-4" onChange={this.login_handleChange_type}>
                    <label className="form-label p-2" htmlFor="typeEmailX-2">Login as:</label>
                    <input type="radio" id="user" name="type" value="user" />
                    <label className="form-label p-2" htmlFor="type" >User </label>
                    <input type="radio" id="admin" name="type" value="admin" />
                    <label className="form-label p-2" htmlFor="type">Admin </label>
                  </div>


                  <button className="btn btn-primary btn-lg btn-block" type="submit">Login</button>
                  <div className="form-outline mt-4">
                    <p className="mb-0">Don't have an account? <a href="/signup" class="text-black-50 fw-bold">Sign Up Now!</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

    );
  };
}
//Signup page
class Sign_up extends React.Component {
  render() {
    return (
      <div className="vh-100" >
        <Sign_up_form />
      </div>
    );
  };
}
class Sign_up_form extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '' };
    this.handleChange_username = this.handleChange_username.bind(this);
    this.handleChange_password = this.handleChange_password.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange_username(event) {
    this.setState({ username: event.target.value });

  }

  handleChange_password(event) {
    this.setState({ password: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const response = await fetch('http://localhost:80/signup?' + 'username=' + this.state.username + '&&password=' + this.state.password);
    const result = await response.text();
    render_fun(result);

  }
  render() {
    return (
      <form id="signup_form" onSubmit={this.handleSubmit}>
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card shadow-2-strong" style={{ borderradius: "1rem" }}>
                <div className="card-body p-5 text-center">
                  <h3 className="mb-5">Sign Up</h3>
                  <div className="form-outline mb-4">
                    <input type="text" name="username" className="form-control form-control-lg" value={this.state.username} onChange={this.handleChange_username} />
                    <label className="form-label" htmlFor="username">Username</label>
                  </div>

                  <div className="form-outline mb-4">
                    <input type="password" name="password" className="form-control form-control-lg" value={this.state.password} onChange={this.handleChange_password} />
                    <label className="form-label" htmlFor="password">Password</label>
                  </div>
                  <div className="form-outline mb-4 mt-4">
                    <button className="btn btn-primary btn-lg btn-block" type="submit" value="Submit">Sign up</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  };
}


class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeLink: 'Active',
    };
  }

  handleActions1Click = () => {
    this.setState({ activeLink: 'actions 1' });
  };

  handleActions2Click = () => {
    this.setState({ activeLink: 'actions 2' });
  };

  handleActions3Click = () => {
    this.setState({ activeLink: 'actions 3' });
  }

  clickActionHandler = (activeLinkStr) => {
    this.setState({ activeLink: activeLinkStr });
  }

  render() {
    let i = '';
    let j = '';
    if (this.props.value == 'user') {
      i = '';
      j = 'NONE';
    } else {
      i = 'NONE';
      j = '';
    }
    return (
      <div>
        <div style={{ display: j }}>
          <h2>You have no permission to visit this page</h2>
        </div>
        <div style={{ display: i }}>
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <Link className={`nav-link ${this.state.activeLink === 'actions 1' ? 'active' : ''}`} to="/user/locations" onClick={this.handleActions1Click}>Locations</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${this.state.activeLink === 'actions 2' ? 'active' : ''}`} to="/user/events" onClick={this.handleActions2Click}>Events</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${this.state.activeLink === 'actions 3' ? 'active' : ''}`} to="/user/favourites" onClick={this.handleActions3Click}>Favourite Locations</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${this.state.activeLink === 'actions 4' ? 'active' : ''}`} to="/user/map" onClick={()=>{this.clickActionHandler('actions 4');}}>Map</Link>
            </li>
          </ul>

          <Routes>
            <Route path="locations" element={<LocationsList />} />
            <Route path="locations/:locationId" element={<Location />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/:eventId" element={<Event />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="map" element={<GoogleMap />} />
          </Routes>

        </div>
      </div>
    );
  };
}

class Admin extends React.Component {

  render() {
    let i = '';
    let j = '';
    if (this.props.value == 'admin') {
      i = '';
      j = 'NONE';
    } else {
      i = 'NONE';
      j = '';
    }
    return (
      <div>
        <div style={{ display: j }}>
          <h2>You have no permission to visit this page</h2>
        </div>
        <div style={{ display: i }}>
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">CRUD event data</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">CRUD user data</a>
            </li>
            <li className="nav-item">
              <a cclassName="nav-link" href="#">etc.....</a>
            </li>
          </ul>
        </div>
      </div>
    );
  };
}

class LocationsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      sortAscending: true,
      searchKeyword: '',
    };
  }

  async componentDidMount() {
    const response = await fetch('http://localhost:80/user/locations');
    const locations = await response.json();
    this.setState({ locations });
  }

  handleSortClick = () => {
    const sortedLocations = [...this.state.locations].sort((a, b) => {
      if (this.state.sortAscending) {
        return a.events.length - b.events.length;
      } else {
        return b.events.length - a.events.length;
      }
    });

    this.setState({
      locations: sortedLocations,
      sortAscending: !this.state.sortAscending,
    });
  };

  handleSearchChange = (event) => {
    this.setState({ searchKeyword: event.target.value });
  };

  render() {
    const filteredLocations = this.state.locations.filter(location =>
      location.name.toLowerCase().includes(this.state.searchKeyword.toLowerCase())
    );

    return (
      <div className="container">
        <div className="row">
          <div className="row mt-3">
            <div className="col">
              <input type="text" className="form-control" value={this.state.searchKeyword} onChange={this.handleSearchChange} placeholder="Search locations..." />
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Name</th>
                  <th style={{ width: '20%' }}>Latitude</th>
                  <th style={{ width: '20%' }}>Longitude</th>
                  <th style={{ width: '10%' }} onClick={this.handleSortClick}>
                    <a href="#">Events</a>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map(location => (
                  <tr key={location.locId}>
                    <td><Link to={`/user/locations/${location.locId}`}>{location.name}</Link></td>
                    <td>{location.latitude}</td>
                    <td>{location.longitude}</td>
                    <td>{location.events.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function Location({ match }) {
  const [location, setLocation] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [favouriteLocations, setFavouriteLocations] = useState([]);
  const { locationId } = useParams();

  useEffect(() => {
    const fetchLocation = async () => {
      const response = await fetch(`http://localhost:80/user/locations/${locationId}`);
      const location = await response.json();
      setLocation(location);
    };

    const fetchFavouriteLocations = async () => {
      const response = await fetch('http://localhost:80/user/favourites');
      const favouriteLocations = await response.json();
      setFavouriteLocations(favouriteLocations);
    };

    fetchLocation();
    fetchFavouriteLocations();
  }, [locationId]);

  const handleCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();

    const newCommentObj = {
      id: Math.random().toString(36).substring(2, 11),
      username: 'Anonymous',
      text: newComment,
    };

    setComments([...comments, newCommentObj]);
    setNewComment('');
  };

  const handleFavouriteClick = async () => {
    const objectId = location._id;

    const favouriteLocation = favouriteLocations.find(favLocation => favLocation._id === objectId);

    if (favouriteLocation) {
      const response = await fetch(`http://localhost:80/user/favourites/${objectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.error('Failed to remove location from favourites');
        return;
      }

      setFavouriteLocations(favouriteLocations.filter(favLocation => favLocation._id !== objectId));
    } else {
      const response = await fetch(`http://localhost:80/user/favourites/${objectId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        console.error('Failed to add location to favourites');
        return;
      }

      setFavouriteLocations([...favouriteLocations, location]);
    }
  };

  if (!location) {
    return null;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>{location.name}</h1>
          {favouriteLocations.find(favLocation => favLocation._id === location._id) ?
            <FaHeart onClick={handleFavouriteClick} style={{ color: 'red' }} />
            :
            <FaRegHeart onClick={handleFavouriteClick} />
          }
          <div style={{width:"200px",height:"200px"}}>
            <SmallMap lat= {location.latitude} lng = {location.longitude} name = {location.name}/>
          </div>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>

        </div>
      </div>
      <div className="row">
        <div className="col">
          <h2>Events</h2>
          <ol>
            {location.events.map(event => (
              <li key={event.eventId}>
                <Link to={`/user/events/${event.eventId}`}>{event.title}</Link> ({event.dateTime})
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h2>Comments</h2>
          <ul>
            {comments.map(comment => (
              <li key={comment.id}>
                <strong>{comment.username}</strong>: {comment.text}
              </li>
            ))}
          </ul>
          <form onSubmit={handleCommentSubmit}>
            <div className="form-group">
              <label htmlFor="comment">New comment</label>
              <textarea className="form-control" id="comment" rows="3" value={newComment} onChange={handleCommentChange}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

class EventList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      sortAscending: true,
      searchKeyword: '',
      priceFilter: '',
    };
  }

  async componentDidMount() {
    const response = await fetch('http://localhost:80/user/events');
    const events = await response.json();
    this.setState({ events });
  }

  handleSortClick = () => {
    const sortedEvents = [...this.state.events].sort((a, b) => {
      if (this.state.sortAscending) {
        return a.events.length - b.events.length;
      } else {
        return b.events.length - a.events.length;
      }
    });

    this.setState({
      events: sortedEvents,
      sortAscending: !this.state.sortAscending,
    });
  };

  handleSearchChange = (event) => {
    this.setState({ searchKeyword: event.target.value });
  };

  handlePriceFilterChange = (event) => {
    this.setState({ priceFilter: event.target.value });
  };

  render() {
    const filteredEvents = this.state.events.filter(event =>
      event.title.toLowerCase().includes(this.state.searchKeyword.toLowerCase()) &&
      (this.state.priceFilter === '' || event.price.some(price => price <= this.state.priceFilter))
    );

    return (
      <div className="container">
        <div className="row">
          <div className="row mt-3">
            <div className="col">
              <input type="text" className="form-control" value={this.state.searchKeyword || ''} onChange={this.handleSearchChange} placeholder="Search events..." />
              <input type="number" className="form-control" value={this.state.priceFilter || ''} onChange={this.handlePriceFilterChange} placeholder="Max price..." />
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col">
            <div className="table-responsive">
              <table className="table table-striped table-hover" style={{ overflow: 'auto' }}>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>Title</th>
                    <th style={{ width: '20%' }}>Location</th>
                    <th style={{ width: '20%' }}>Description</th>
                    <th style={{ width: '20%' }}>Date & Time</th>
                    <th style={{ width: '10%' }}>Presenter</th>
                    <th style={{ width: '10%' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => (
                    <tr key={event.eventId}>
                      <td><Link to={`/user/events/${event.eventId}`}>{event.title || '-'}</Link></td>
                      <td><Link to={`/user/locations/${event.location.locId}`}>{event.location.name || '-'}</Link></td>
                      <td>{event.description || '-'}</td>
                      <td>{event.dateTime || '-'}</td>
                      <td>{event.presenter || '-'}</td>
                      <td>{event.price.length > 0 ? event.price.map(price => `$${price}`).join(', ') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function Event({ match }) {
  const [event, setEvent] = useState(null);
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEvent = async () => {
      const response = await fetch(`http://localhost:80/user/events/${eventId}`);
      const event = await response.json();
      setEvent(event);
    };

    fetchEvent();
  }, [eventId]);

  if (!event) {
    return null;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>{event.title || '-'}</h1>
          <h5>Location</h5>
          <p><Link to={`/user/locations/${event.location.locId}`}>{event.location.name || '-'}</Link></p>
          <h5>Description</h5>
          <p>{event.description || '-'}</p>
          <h5>Date & Time</h5>
          <p>{event.dateTime || '-'}</p>
          <h5>Presenter</h5>
          <p>{event.presenter || '-'}</p>
          <h5>Prices</h5>
          <p>{event.price.length > 0 ? event.price.map(price => `$${price}`).join(', ') : '-'}</p>
        </div>
      </div>
    </div>
  );
}

class Favourites extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
      sortAscending: true,
      searchKeyword: '',
    };
  }

  async componentDidMount() {
    const response = await fetch('http://localhost:80/user/favourites');
    const locations = await response.json();
    this.setState({ locations });
  }

  handleSortClick = () => {
    const sortedLocations = [...this.state.locations].sort((a, b) => {
      if (this.state.sortAscending) {
        return a.events.length - b.events.length;
      } else {
        return b.events.length - a.events.length;
      }
    });

    this.setState({
      locations: sortedLocations,
      sortAscending: !this.state.sortAscending,
    });
  };

  handleSearchChange = (event) => {
    this.setState({ searchKeyword: event.target.value });
  };

  render() {
    const filteredLocations = this.state.locations.filter(location =>
      !this.state.searchKeyword || (location.name && location.name.toLowerCase().includes(this.state.searchKeyword.toLowerCase()))
    );

    return (
      <div className="container">
        <div className="row">
          <div className="row mt-3">
            <div className="col">
              <input type="text" className="form-control" value={this.state.searchKeyword} onChange={this.handleSearchChange} placeholder="Search locations..." />
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Name</th>
                  <th style={{ width: '20%' }}>Latitude</th>
                  <th style={{ width: '20%' }}>Longitude</th>
                  <th style={{ width: '10%' }} onClick={this.handleSortClick}>
                    <a href="#">Events</a>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.map(location => (
                  <tr key={location.locId}>
                    <td><Link to={`/user/locations/${location.locId}`}>{location.name}</Link></td>
                    <td>{location.latitude}</td>
                    <td>{location.longitude}</td>
                    <td>{location.events.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

class NoMatch extends React.Component {
  render() {
    return <h2>404 Not Found</h2>;

  }
}


const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(<App name="Project" />);
