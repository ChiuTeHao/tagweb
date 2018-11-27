import React from 'react'
import PropTypes from 'prop-types'

import './SearchBar.css'

const SearchBar = (props) => {
  const { handleFormSubmit, topicId, query, topicList, handleTopicChange, handleQueryChange } = props

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
            onChange={async (e) => {
              await handleTopicChange(e)
              handleFormSubmit(e)
            }}
          >
            <option disable="true" value="defaule" style={{ display: 'none' }}>select topic here</option>
            {topicList.map((topicDic, i) =>
              <option value={i} key={topicDic.queryText}>
                {i}: {topicDic.topic}
              </option>
            )}
          </select>
        </div>
      </form>
    </div>
  )
}

SearchBar.propTypes = {
  topicList: PropTypes.array,
  topicId: PropTypes.string,
  query: PropTypes.string,
  handleTopicChange: PropTypes.func,
  handleQueryChange: PropTypes.func,
  handleFormSubmit: PropTypes.func,
}

export default SearchBar
