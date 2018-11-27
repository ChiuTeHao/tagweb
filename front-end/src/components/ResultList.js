import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highlighter from 'react-highlight-words'
import CircularProgress from '@material-ui/core/CircularProgress'
import DoneIcon from '@material-ui/icons/Done'
import FlagIcon from '@material-ui/icons/Flag'

import './ResultList.css'

import PageList from './PageList.js'
import Analysis from './topic/Analysis.js'

const Filter = (props) => {
  const { isCheck, columns, check } = props
  return (
    <div id="filter">
      <p>Show in Table:</p>
      {/*<div
        className={ isLabel? 'active' : '' }
      >
        <input
          type="checkbox"
          checked={ isLabel? 'checked' : '' }
          onChange={handleIsLabelChange}
        />
        <label>
          Labeled
        </label>
      </div>*/}
      {columns.map(col => (
        <div
          key={ col }
          className={ isCheck[col]? 'active' : '' }
        >
          <input
            type="checkbox"
            onChange={ () => {check(col)} }
            checked={ isCheck[col]? 'checked' : '' }
          />
          <label>
            { col }
          </label>
        </div>
      ))}
    </div>
  )
}

Filter.propTypes = {
  isLabel: PropTypes.bool,
  handleIsLabelChange: PropTypes.func,

  isCheck: PropTypes.object,
  columns: PropTypes.array,
  check: PropTypes.func,
}

class ResultList extends Component {
  columns = [
    'date',
    'author',
    'score',
    'senti',
  ]

  state = {
    isCheck: {
      date: false,
      author: true,
      score: true,
      senti: true,
    }
  }

  senti = {
    0: {
      name: 'negative',
      color: '#ff8a65',
    },
    1: {
      name: 'neutral',
      color: '#fff176',
    },
    2: {
      name: 'positive',
      color: '#aed581',
    },
  }

  check (col) {
    let newIsCheck = JSON.parse(JSON.stringify(this.state.isCheck))
    newIsCheck[col] = !newIsCheck[col] // toggle newIsCheck[check]
    this.setState({
      isCheck: newIsCheck,
    })
  }

  render () {
    const {
      result, waitingResult, showContent, totRank, currRank, turnPage
    } = this.props

    const { status, useTime, resultList, querySegList } = result
    let highlightWords = []
    for (let segId in querySegList) {
      highlightWords = highlightWords.concat(querySegList[segId])
    }

    if (waitingResult) {
      return (
        <div id="result">
          <CircularProgress />
        </div>
      )
    } else if (status) {
      return (
        <div>
          <Analysis
            totRank={totRank}
            querySegList={querySegList}
            useTime={useTime}
          />
          <PageList
            totRank={result.totPage}
            currRank={currRank}
            turnPage={turnPage}
          />
          <div id="result">
            <div className="card">
              {/*<div style={{
                textAlign: 'center',
                margin: '0.5em',
              }}>
                <button onClick={sendSubmit}>
                  Refresh (<u>5</u>)
                </button>
              </div>*/}
              <Filter
                isLabel={this.props.isLabel}
                handleIsLabelChange={this.props.handleIsLabelChange}

                isCheck={this.state.isCheck}
                columns={this.columns}
                check={this.check.bind(this)}
              />
              <div id="resultList">
                <table>
                  <thead>
                    <tr>
                      <th className="rank">Labeled</th>
                      <th className="rank">Rank</th>
                      {this.state.isCheck.date? (
                        <th className="date">Date</th>
                      ) : null}
                      {this.state.isCheck.author? (
                        <th className="author">Author</th>
                      ) : null}
                      <th className="title">Title</th>
                      {this.state.isCheck.score? (
                        <th className="score">Relevant</th>
                      ) : null}
                      {this.state.isCheck.senti? (
                        <th className="score">Sentiment</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {resultList.map((res, id) =>
                      <tr
                        key={res.rank_id}
                      >
                        <td className="rank">
                          {res.label.status? (
                            res.label.labelStatus === 2? (
                              <DoneIcon />
                            ) : (
                              res.label.labelStatus === 1? (
                                <FlagIcon />
                              ) : null
                            )
                          ) : null}
                        </td>
                        <td className="rank">
                          {res.rank_id + 1}
                        </td>
                        {this.state.isCheck.date? (
                          <td className="date">
                            {res.date.split(' ')[0]}
                          </td>
                        ) : null}
                        {this.state.isCheck.author? (
                          <td className="author">
                            {res.author.split(' ')[0] === '-----'? '自由時報' : res.author.split(' ')[0]}
                          </td>
                        ) : null}
                        <td className="title">
                          <a
                            onClick={ () => {showContent(id)} }
                          >
                            <Highlighter
                              highlightClassName="highlight-text"
                              searchWords={highlightWords}
                              autoEscape={true}
                              textToHighlight={res.title}
                            />
                          </a>
                        </td>
                        {this.state.isCheck.score? (
                          <td
                            className="score"
                            style={{
                              backgroundColor: 'rgba(211, 47, 47,'
                                               + `${res.score / 30 * 1})`,
                            }}
                          >
                            {res.score.toFixed(3)}
                          </td>
                        ) : null}
                        {this.state.isCheck.senti? (
                          <td
                            className="score senti"
                            style={{
                              backgroundColor: this.senti[res.sa_score].color,
                            }}
                          >
                            { this.senti[res.sa_score].name }
                          </td>
                        ) : null}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <PageList
            totRank={result.totPage}
            currRank={currRank}
            turnPage={turnPage}
          />
        </div>
      )
    } else {
      return null
    }
  }
}

ResultList.propTypes = {
  result: PropTypes.object,
  isLabel: PropTypes.bool,
  handleIsLabelChange: PropTypes.func,
  sendSubmit: PropTypes.func,

  waitingResult: PropTypes.bool,
  showContent: PropTypes.func,
  currRank: PropTypes.number,
  totRank: PropTypes.number,
  turnPage: PropTypes.func,
}

export default ResultList
