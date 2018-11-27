import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '@material-ui/core/Tooltip'
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn'
import KeyboardTabIcon from '@material-ui/icons/KeyboardTab'

import './SearchBar.css'

const SearchBar = (props) => {
  const { handleFormSubmit, topicId, topicList, addQuery, subQuery, handleTopicChange,
          handleQueryChange, queryList } = props

  return (
    <div id="searchBar">
      <form
        className="card"
        onSubmit={handleFormSubmit}
      >
        <div>
          <select
            name="topic"
            value={topicId}
            onChange={handleTopicChange}
          >
            <option disable="true" value="defaule" style={{ display: 'none' }}>select topic here</option>
            {topicList.map((topicDic, i) =>
              <option value={i} key={topicDic.queryText}>
                {i}: {topicDic.topic}
              </option>
            )}
          </select>
        </div>
        {queryList.map((query, i) => (
          <div key={i}>
            <input
              type="text"
              name="queryList"
              placeholder="input query here"
              className={(i === queryList.length - 1)? 'last-query' : null}
              value={query}
              onChange={(e) => {handleQueryChange(e, i)}}
            />
            {(queryList.length === 1)? null : (
              <span>
                <button style={{ display: 'none' }} onClick={(e) => {e.preventDefault()}}></button>
                <button className="add-sub-query sub-query" onClick={(e) => {e.preventDefault(); subQuery(i)}} tabIndex="-1" >
                  -
                </button>
                <button style={{ display: 'none' }} onClick={(e) => {e.preventDefault()}}></button>
              </span>
            )}
          </div>
        ))}
        <div style={{ margin: 8 }}>
          <Tooltip title={
            <KeyboardTabIcon />
          }>
            <button className="add-sub-query add-query" onClick={(e) => {e.preventDefault(); addQuery()}} >
              +
            </button>
          </Tooltip>
          <Tooltip title={
            <KeyboardReturnIcon />
          }>
            <button type="submit" >
              Submit
            </button>
          </Tooltip>
        </div>
      </form>
    </div>
  )
}

SearchBar.propTypes = {
  topicList: PropTypes.array,
  topicId: PropTypes.string,
  queryList: PropTypes.array,
  subQuery: PropTypes.func,
  addQuery: PropTypes.func,
  handleTopicChange: PropTypes.func,
  handleQueryChange: PropTypes.func,
  handleFormSubmit: PropTypes.func,
}

export default SearchBar
