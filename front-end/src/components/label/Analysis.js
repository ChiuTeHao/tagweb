import React, { Component } from 'react'
import PropTypes from 'prop-types'

import './Analysis.css'

const Analysis = (props) => {
  return (
    <div style={{ display: null }}>
    </div>
  )
}

Analysis.propTypes = {
  totRank: PropTypes.number,
  querySegList: PropTypes.array,
  useTime: PropTypes.number,
}

export default Analysis
