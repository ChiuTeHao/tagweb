import React from 'react'
import PropTypes from 'prop-types'
import CircularProgress from '@material-ui/core/CircularProgress'

import './Register.css'

const Register = (props) => {
  const { title, text, status, waiting, register } = props
  return (
    <div id="register" className="card">
      <h2>{title}</h2>
      <p>{text}</p>
      <form
        onSubmit={register}
      >
        <div>
          <input
            type="text"
            name="name"
            placeholder="Account Name"
          />
        </div>
        {(!status.message)? null : (
          <div
            className={status.status? 'success' : 'fail'}
            style={{ padding: '0.3em' }}
          >
            {status.message}
          </div>
        )}
        <div>
          <span style={{ visibility: 'hidden' }}>
            <CircularProgress size={20} />
          </span>
          <button type="submit">
            {title}
          </button>
          <span style={{
            visibility: waiting? 'visible': 'hidden',
          }}>
            <CircularProgress size={20} />
          </span>
        </div>
      </form>
    </div>
  )
}

Register.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string,
  status: PropTypes.object,
  waiting: PropTypes.bool,
  register: PropTypes.func,
}

export default Register
