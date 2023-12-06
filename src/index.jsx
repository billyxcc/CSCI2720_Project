import ReactDOM from 'react-dom/client'
import React from 'react';
// import { useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// import { useMatch, useParams, useLocation } from 'react-router-dom';

class App extends React.Component{
  render(){
    return (
      <BrowserRouter>
        <div>
          <Navigation />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Sign_up />} />
            <Route exact path="/user" element={<User />} />
      
            <Route path="*" element={<NoMatch />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}
//Navbar
class Navigation extends React.Component{
  render() {
    return (
      <nav class="navbar bg-info-subtle">
        <div class="container-fluid">
          <span class="navbar-brand mb-0 h1">Cultural.io</span>
          
        <div class="col-md-3 text-end">
        <button type="button " class="btn btn-outline-primary me-2 bg-white" onClick={(e)=>window.location.href='/login'}>Login</button>
        <button type="button"  class="btn btn-primary" onClick={(e)=>window.location.href='/signup'}>Signup</button>
        </div>
        </div>
      </nav>
  )}
};
//home page
class Home extends React.Component{
  render() {
    return (<div class="vh-100">
            <h2>Home</h2>
            <form>
           Enter name: <input type="text" name="fname"/>
            <input type="submit" value="Submit"/>
          </form>
            </div>);
  };
}
//login page
class Login extends React.Component{

  render() {
    return (  
      <div class="vh-100">
          <Login_form/>
      </div>  
  );
  };
}
class Login_form extends React.Component{
  render(){
    return(
      <form id="login_form">
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-12 col-md-8 col-lg-6 col-xl-5">
            <div class="card shadow-2-strong" style={{borderradius:"1rem"}}>
              <div class="card-body p-5 text-center">
                <h3 class="mb-5">Log in</h3>
                <div class="form-outline mb-4">
                <input type="text" id="username" class="form-control form-control-lg" />
                <label class="form-label" for="typeEmailX-2">Username</label>
                </div>

              <div class="form-outline mb-4">
                <input type="password" id="typePasswordX-2" class="form-control form-control-lg" />
                <label class="form-label" for="typePasswordX-2">Password</label>
              </div>
              <div class="form-outline mb-4">
                <label class="form-label p-2" for="typeEmailX-2">Login as:</label>
                <input type="radio" id="user" name="type" value="user"/>
                <label class="form-label p-2" for="type" >User </label>
                <input type="radio" id="admin" name="type" value="admin"/>
                <label class="form-label p-2" for="type">Admin </label>
              </div>
              <button class="btn btn-primary btn-lg btn-block" type="submit">Login</button>
              <div class="form-outline mt-4">
                <p class="mb-0">Don't have an account? <a href="/signup" class="text-black-50 fw-bold">Sign Up Now!</a>
                </p>
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
class Sign_up extends React.Component{
  render() {
    return (
      <div class="vh-100" >
        <Sign_up_form/>
      </div>
    );
  };
}
class Sign_up_form extends React.Component{
  constructor(props) {
    super(props);
    this.state = {username:'', password: ''};
    this.handleChange_username = this.handleChange_username.bind(this);
    this.handleChange_password = this.handleChange_password.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
}
handleChange_username(event) {
  this.setState({username: event.target.value});  
}
handleChange_password(event) {
  this.setState({password: event.target.value});  
}

handleSubmit(event) {
  fetch('http://localhost:80/signup?'+'username='+this.state.username+'&&password='+this.state.password);
        
}
  render(){
    return(
      <form id="signup_form" onSubmit={this.handleSubmit}>
      <div class="container py-5 h-100">
        <div class="row d-flex justify-content-center align-items-center h-100">
          <div class="col-12 col-md-8 col-lg-6 col-xl-5">
            <div class="card shadow-2-strong" style={{borderradius:"1rem"}}>
              <div class="card-body p-5 text-center">
                <h3 class="mb-5">Sign Up</h3>
                <div class="form-outline mb-4">
                <input type="text" name="username"  class="form-control form-control-lg" value={this.state.username} onChange={this.handleChange_username} />
                <label class="form-label" for="username">Username</label>
                </div>

              <div class="form-outline mb-4">
                <input type="password" name="password" class="form-control form-control-lg" value={this.state.password} onChange={this.handleChange_password} />
                <label class="form-label" for="password">Password</label>
              </div>
              <div class="form-outline mb-4 mt-4">
                <button class="btn btn-primary btn-lg btn-block" type="submit" value="Submit">Sign up</button>
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


class User extends React.Component{

  render(){
    return(
      <ul class="nav nav-tabs">
      <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="#">Active</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Link</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#">Link</a>
      </li>
      <li class="nav-item">
        <a class="nav-link diabled" aria-disabled="true">Disabled</a>
      </li>
    </ul>
    );
  };
}
class NoMatch extends React.Component{
  render() {
    return <h2>404 Not Found</h2>;
    
  }
}


const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render( <App name="CUHK pictures" />);