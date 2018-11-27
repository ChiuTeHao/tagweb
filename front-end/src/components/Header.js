import React from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'

import './Header.css'

const Login = (props) => {
  const {login, loginMsg} = props

  return (
    <div id="login">
      {loginMsg? (
        <div className="loginMsg">
          {loginMsg}
        </div>
      ) : null}
      <form onSubmit={login}>
        <input type="text" name="name" />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

Login.propTypes = {
  login: PropTypes.func,
  loginMsg: PropTypes.string,
}

const Name = (props) => {
  const {name, logout} = props

  return (
    <div id="name">
      <p><b>{name}</b></p>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  )
}

Name.propTypes = {
  name: PropTypes.string,
  logout: PropTypes.func,
}

const Header = (props) => {
  const {
    title, name, activeTab, tabs, changeActiveTab,
    loginStatus, login, logout, waitingLogin
  } = props

  return (
    <div id="header">
      <div className="title">
        <div className="inside">
          <a>
            {title}
          </a>
        </div>
      </div>
      <div className="tabs">
        {waitingLogin? (
          <CircularProgress color="inherit" />
        ) : null}
        {loginStatus.status? (
          <Name
            name={name}
            logout={logout}
          />
        ) : (
          <Login
            login={login}
            loginMsg={loginStatus.message}
          />
        )}
        {tabs.map(tab => (
          <a
            key={tab}
            className={['tab', activeTab === tab? 'active': ''].join(' ')}
            onClick={() => {changeActiveTab(tab)}}
          >
            {tab}
          </a>
        ))}
      </div>
    </div>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  /* Tabs */
  activeTab: PropTypes.string,
  tabs: PropTypes.array,
  changeActiveTab: PropTypes.func,
  /* Login */
  waitingLogin: PropTypes.bool,
  loginStatus: PropTypes.object,
  name: PropTypes.string,
  login: PropTypes.func,
  logout: PropTypes.func,
}

export default Header
