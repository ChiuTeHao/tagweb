import React from 'react'
import PropTypes from 'prop-types'

import './Analysis.css'

const Analysis = (props) => {
  const { totRank, querySegList, useTime } = props

  return (
    <div id="attr" className="card">
      <div className="text">
        <p>Non Zero Count: <b>{totRank}</b>.</p>
      </div>
      <div id="topic-seg">
        <div className="label">Query Sets:</div>
        <div style={{ margin: 2 }}>
          {querySegList.map(querySeg =>
            <div className="query-segs" key={querySeg}>
              {querySeg.map(t =>
                <button key={t} disabled="true">
                  {t}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="text">
        <p>Search Time: <b>{useTime}</b> seconds.</p>
      </div>
    </div>
  )
}

Analysis.propTypes = {
  totRank: PropTypes.number,
  querySegList: PropTypes.array,
  useTime: PropTypes.number,
}

export default Analysis
